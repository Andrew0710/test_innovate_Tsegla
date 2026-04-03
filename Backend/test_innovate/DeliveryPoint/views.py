from rest_framework import viewsets
from .models import DeliveryPoint, Order
from .serializers import DeliveryPointSerializer, OrderSerializer

class DeliveryPointViewSet(viewsets.ModelViewSet):
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer