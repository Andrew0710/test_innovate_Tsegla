from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryPointViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'points', DeliveryPointViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)), 
]