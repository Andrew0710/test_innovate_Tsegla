from rest_framework import serializers
from .models import DeliveryPoint, Order

class DeliveryPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPoint
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approval_mode_display = serializers.CharField(source='get_approval_mode_display', read_only=True)
    decided_by_username = serializers.CharField(source='decided_by.username', read_only=True)
    priority_score = serializers.FloatField(read_only=True)
    demand_ratio = serializers.FloatField(read_only=True)
    priority_multiplier = serializers.FloatField(read_only=True)
    time_since_last_delivery = serializers.FloatField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'delivery_point',
            'priority',
            'priority_display',
            'content',
            'urgency_level',
            'urgency_display',
            'quantity',
            'status',
            'status_display',
            'approval_mode',
            'approval_mode_display',
            'decision_reason',
            'decided_by',
            'decided_by_username',
            'decided_at',
            'time',
            'priority_score',
            'demand_ratio',
            'priority_multiplier',
            'time_since_last_delivery',
        ]