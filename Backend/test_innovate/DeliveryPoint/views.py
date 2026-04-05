from rest_framework import viewsets
from .models import DeliveryPoint, Order
from .serializers import DeliveryPointSerializer, OrderSerializer
import math
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

class DeliveryPointViewSet(viewsets.ModelViewSet):
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer

    @action(detail=True, methods=['get'], url_path='requests')
    def requests_for_point(self, request, pk=None):
        point = self.get_object()
        limit = min(int(request.query_params.get('limit', 20)), 100)
        orders = Order.objects.filter(delivery_point=point).order_by('-time')[:limit]
        return Response(OrderSerializer(orders, many=True).data)

    @action(detail=False, methods=['get'], url_path='surplus')
    def surplus_points(self, request):
        target_id = request.query_params.get('target_id')
        target = None

        if target_id:
            try:
                target = DeliveryPoint.objects.get(id=target_id)
            except DeliveryPoint.DoesNotExist:
                return Response({"error": "Цільову точку не знайдено"}, status=status.HTTP_404_NOT_FOUND)

        donors = DeliveryPoint.objects.filter(current_stock_percent__gte=60)
        if target is not None:
            donors = donors.exclude(id=target.id)

        payload = []
        for donor in donors:
            distance = None
            if target is not None:
                distance = round(math.hypot(donor.x_coord - target.x_coord, donor.y_coord - target.y_coord), 2)

            payload.append({
                "id": donor.id,
                "name": donor.name,
                "current_stock_percent": donor.current_stock_percent,
                "need_capacity": donor.need_capacity,
                "distance": distance,
            })

        payload.sort(key=lambda d: d["distance"] if d["distance"] is not None else float('inf'))
        return Response(payload)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('delivery_point').all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = self.queryset.order_by('-time')
        statuses_param = self.request.query_params.get('status')
        if statuses_param:
            requested_statuses = [s.strip().upper() for s in statuses_param.split(',') if s.strip()]
            allowed_statuses = {choice[0] for choice in Order.Status.choices}
            valid_statuses = [s for s in requested_statuses if s in allowed_statuses]
            if valid_statuses:
                queryset = queryset.filter(status__in=valid_statuses)
        return queryset

    def _is_dispatcher(self, user):
        return bool(
            user
            and user.is_authenticated
            and hasattr(user, 'profile')
            and user.profile.role == 'DISPATCHER'
        )

    def _critical_auto_approval(self, order):
        if order.urgency_level != Order.Urgency.CRITICAL:
            return False, 'Low/normal requests require manual dispatcher approval.'

        if order.delivery_point.current_stock_percent > 20:
            return False, 'Critical auto-approval is only allowed for stock at or below 20%.'

        donors = DeliveryPoint.objects.filter(current_stock_percent__gt=80).exclude(id=order.delivery_point.id)
        if not donors.exists():
            return False, 'No eligible donor point available for critical auto-approval.'

        return True, 'Auto-approved: critical shortage and donor point available.'

    def _apply_initial_decision(self, order):
        should_auto_approve, reason = self._critical_auto_approval(order)
        order.decision_reason = reason

        if should_auto_approve:
            order.status = Order.Status.REDIRECTED
            order.approval_mode = Order.ApprovalMode.AUTO
            order.decided_at = timezone.now()
            order.decided_by = None
        else:
            order.status = Order.Status.PENDING
            order.approval_mode = Order.ApprovalMode.NONE
            order.decided_at = None
            order.decided_by = None

        order.save(update_fields=['status', 'approval_mode', 'decision_reason', 'decided_at', 'decided_by'])

    def perform_create(self, serializer):
        order = serializer.save(status=Order.Status.PENDING)
        self._apply_initial_decision(order)

    def _priority_multiplier(self, order):
        if order.urgency_level == Order.Urgency.CRITICAL:
            return 2.5
        if order.urgency_level == Order.Urgency.NORMAL:
            return 1.5
        return 1.0

    def _time_since_last_delivery_hours(self, order):
        now = timezone.now()
        if order.delivery_point.next_delivery:
            # Positive value means the expected delivery time has already passed.
            overdue = (now - order.delivery_point.next_delivery).total_seconds() / 3600
            return max(overdue, 0.0)
        return max((now - order.time).total_seconds() / 3600, 0.0)

    def _priority_score(self, order):
        need_capacity = max(order.delivery_point.need_capacity, 1)
        stock_factor = (100 - order.delivery_point.current_stock_percent) / 100
        demand_ratio = (order.quantity / need_capacity) * (1 + stock_factor)
        priority_multiplier = self._priority_multiplier(order)
        time_since_last_delivery = self._time_since_last_delivery_hours(order)

        score = (demand_ratio * priority_multiplier) + time_since_last_delivery
        return {
            "score": round(score, 3),
            "demand_ratio": round(demand_ratio, 3),
            "priority_multiplier": priority_multiplier,
            "time_since_last_delivery": round(time_since_last_delivery, 3),
        }

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        orders = self.get_queryset().filter(
            status=Order.Status.PENDING,
            approval_mode=Order.ApprovalMode.NONE,
        )
        ranked = []

        for order in orders:
            score_data = self._priority_score(order)
            order_data = self.get_serializer(order).data
            order_data['priority_score'] = score_data['score']
            order_data['demand_ratio'] = score_data['demand_ratio']
            order_data['priority_multiplier'] = score_data['priority_multiplier']
            order_data['time_since_last_delivery'] = score_data['time_since_last_delivery']
            ranked.append(order_data)

        ranked.sort(key=lambda o: o['priority_score'], reverse=True)
        return Response(ranked)
    
    @action(detail=True, methods=['get'])
    def suggest_redirect(self, request, pk=None):
        order = self.get_object()
        target_point = order.delivery_point

        donors = DeliveryPoint.objects.filter(current_stock_percent__gt=80).exclude(id=target_point.id)

        if not donors.exists():
            return Response(
                {"message": "Не знайдено жодної точки з достатнім запасом (>80%). Редирект неможливий."}, 
                status=404
            )

        best_donor = None
        min_distance = float('inf')

        for donor in donors:
            distance = math.hypot(donor.x_coord - target_point.x_coord, donor.y_coord - target_point.y_coord)
            
            if distance < min_distance:
                min_distance = distance
                best_donor = donor

        if best_donor:
            return Response({
                "status": "success",
                "suggestion": f"Рекомендуємо забрати ресурси з {best_donor.name} та відправити до {target_point.name}",
                "donor_id": best_donor.id,
                "target_id": target_point.id,
                "distance": round(min_distance, 2)
            })

    @action(detail=True, methods=['post'])
    def approve_redirect(self, request, pk=None):
        order = self.get_object()
        if not self._is_dispatcher(request.user):
            return Response({"error": "Only dispatchers can approve redirects"}, status=status.HTTP_403_FORBIDDEN)

        if order.status != Order.Status.PENDING:
            return Response({"error": "Замовлення вже оброблене"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.REDIRECTED
        order.approval_mode = Order.ApprovalMode.MANUAL
        order.decision_reason = request.data.get('reason', 'Manually approved by dispatcher.')
        order.decided_at = timezone.now()
        order.decided_by = request.user
        order.save(update_fields=['status', 'approval_mode', 'decision_reason', 'decided_at', 'decided_by'])
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def reject_request(self, request, pk=None):
        order = self.get_object()
        if not self._is_dispatcher(request.user):
            return Response({"error": "Only dispatchers can reject requests"}, status=status.HTTP_403_FORBIDDEN)

        if order.status != Order.Status.PENDING or order.approval_mode != Order.ApprovalMode.NONE:
            return Response({"error": "Only undecided pending orders can be rejected"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.REJECTED
        order.approval_mode = Order.ApprovalMode.MANUAL
        order.decision_reason = request.data.get('reason', 'Rejected by dispatcher.')
        order.decided_at = timezone.now()
        order.decided_by = request.user
        order.save(update_fields=['status', 'approval_mode', 'decision_reason', 'decided_at', 'decided_by'])
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def mark_loading(self, request, pk=None):
        order = self.get_object()
        if not self._is_dispatcher(request.user):
            return Response({"error": "Only dispatchers can mark loading"}, status=status.HTTP_403_FORBIDDEN)

        if order.status != Order.Status.REDIRECTED:
            return Response({"error": "Only redirected orders can move to loading"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.LOADING
        order.save(update_fields=['status'])
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'])
    def fulfill(self, request, pk=None):
        order = self.get_object()
        if order.status == Order.Status.FULFILLED:
            return Response({"error": "Замовлення вже виконане"}, status=status.HTTP_400_BAD_REQUEST)

        if order.status not in (Order.Status.REDIRECTED, Order.Status.LOADING):
            return Response(
                {"error": "Only approved/loading orders can be fulfilled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivered_quantity = int(request.data.get('delivered_quantity', order.quantity) or order.quantity)

        point = order.delivery_point
        denominator = max(point.need_capacity, 1)
        delivered_percent = int((delivered_quantity / denominator) * 100)
        point.current_stock_percent = min(100, point.current_stock_percent + delivered_percent)

        if point.current_stock_percent <= 20:
            point.priority_level = DeliveryPoint.Priority.CRITICAL
        elif point.current_stock_percent <= 50:
            point.priority_level = DeliveryPoint.Priority.NORMAL
        else:
            point.priority_level = DeliveryPoint.Priority.LOW

        point.save(update_fields=['current_stock_percent', 'priority_level'])

        order.status = Order.Status.FULFILLED
        order.save(update_fields=['status'])

        return Response({
            "order": self.get_serializer(order).data,
            "delivery_point": DeliveryPointSerializer(point).data,
        })
        
    @action(detail=False, methods=['post'], url_path='urgent')
    def create_urgent(self, request):
        point_id = request.data.get('delivery_point_id')
        quantity = request.data.get('quantity', 0)
        content = request.data.get('content', '')

        if not point_id:
            return Response(
                {"error": "Необхідно передати delivery_point_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_point = DeliveryPoint.objects.get(id=point_id)
        except DeliveryPoint.DoesNotExist:
            return Response(
                {"error": "Точку доставки не знайдено у базі"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        order = Order.objects.create(
            delivery_point=target_point,
            priority=DeliveryPoint.Priority.CRITICAL,
            content=content,
            urgency_level=Order.Urgency.CRITICAL,
            quantity=quantity,
            status=Order.Status.PENDING
        )

        self._apply_initial_decision(order)

        target_point.priority_level = DeliveryPoint.Priority.CRITICAL
        target_point.save(update_fields=['priority_level'])

        serializer = self.get_serializer(order)
        return Response({
            "status": "success",
            "message": "Критичний запит створено. Система готова до пошуку донора.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        
        role = user.profile.role if hasattr(user, 'profile') else 'UNKNOWN'
        workplace_id = user.profile.workplace.id if hasattr(user, 'profile') and user.profile.workplace else None

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': role,
            'workplace_id': workplace_id
        })
    else:
        return Response({'error': 'Невірний логін або пароль'}, status=status.HTTP_401_UNAUTHORIZED)