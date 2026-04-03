from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('Warehouse.urls')),
    path('api/delivery/', include('DeliveryPoint.urls'))

]
