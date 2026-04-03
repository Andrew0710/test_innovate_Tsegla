from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TruckViewSet, WarehouseViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'trucks', TruckViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)), 
]