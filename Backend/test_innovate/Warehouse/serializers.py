from rest_framework import serializers
from .models import Truck, Warehouse, Product

# Новий серіалізатор для складів
class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'

# Новий серіалізатор для товарів
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# Твій старий серіалізатор для вантажівок
class TruckSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Truck
        fields = '__all__'