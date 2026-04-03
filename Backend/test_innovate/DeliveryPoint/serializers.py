from rest_framework import serializers
from .models import DeliveryPoint, Order

class DeliveryPointSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_level_display', read_only=True)

    class Meta:
        model = DeliveryPoint
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'