from django.db.models import F, ExpressionWrapper, FloatField, Case, When
from rest_framework import viewsets
from .models import DeliveryPoint, Order
from .serializers import DeliveryPointSerializer, OrderSerializer
import math
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class DeliveryPointViewSet(viewsets.ModelViewSet):
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        multiplier = Case(
            When(urgency_level=Order.Urgency.CRITICAL, then=5.0),
            When(urgency_level=Order.Urgency.NORMAL, then=1.0),
            When(urgency_level=Order.Urgency.LOW, then=0.5),
            default=1.0,
            output_field=FloatField()
        )

        score_expression = ExpressionWrapper(
            (100 - F('delivery_point__current_stock_percent')) * multiplier,
            output_field=FloatField()
        )

        return Order.objects.annotate(
            priority_score=score_expression
        ).order_by('-priority_score')
    
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
        
    @action(detail=False, methods=['post'], url_path='urgent')
    def create_urgent(self, request):
        point_id = request.data.get('delivery_point_id')
        quantity = request.data.get('quantity', 0)

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
            urgency_level=Order.Urgency.CRITICAL,
            quantity=quantity,
            status=Order.Status.PENDING
        )

        serializer = self.get_serializer(order)
        return Response({
            "status": "success",
            "message": "Критичний запит створено. Система готова до пошуку донора.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)