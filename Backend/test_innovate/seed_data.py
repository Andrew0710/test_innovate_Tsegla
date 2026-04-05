import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'test_innovate.settings')
django.setup()

from Warehouse.models import Warehouse, Product, Truck
from DeliveryPoint.models import DeliveryPoint, Order

def seed():
    # Clear existing data
    Order.objects.all().delete()
    DeliveryPoint.objects.all().delete()
    Truck.objects.all().delete()
    Product.objects.all().delete()
    Warehouse.objects.all().delete()

    print("Seeding database...")

    # 1. Create Warehouses
    hub = Warehouse.objects.create(
        name="Central Hub",
        x_coord=500,
        y_coord=500,
        delivery_radius=1000
    )
    north_station = Warehouse.objects.create(
        name="North Station",
        x_coord=500,
        y_coord=900,
        delivery_radius=500
    )

    # 2. Create Products
    Product.objects.create(warehouse=hub, name="Fuel Cells", count=500, mass=10)
    Product.objects.create(warehouse=hub, name="Emergency Kits", count=200, mass=5)
    Product.objects.create(warehouse=north_station, name="Fuel Cells", count=100, mass=10)

    # 3. Create Trucks
    Truck.objects.create(
        warehouse=hub,
        capacity=1000,
        current_load=0,
        current_x=500,
        current_y=500,
        status=0 # STATIONARY
    )
    Truck.objects.create(
        warehouse=hub,
        capacity=1500,
        current_load=800,
        current_x=250,
        current_y=350,
        status=1 # TO_ORDER
    )
    Truck.objects.create(
        warehouse=north_station,
        capacity=800,
        current_load=0,
        current_x=500,
        current_y=900,
        status=0 # STATIONARY
    )

    # 4. Create Delivery Points
    DeliveryPoint.objects.create(
        name="Point Alpha",
        x_coord=200,
        y_coord=300,
        priority_level=3, # CRITICAL
        need_name="Fuel Cells",
        need_capacity=50
    )
    DeliveryPoint.objects.create(
        name="Point Beta",
        x_coord=800,
        y_coord=200,
        priority_level=2, # NORMAL
        need_name="Emergency Kits",
        need_capacity=20
    )
    DeliveryPoint.objects.create(
        name="Point Delta",
        x_coord=300,
        y_coord=700,
        priority_level=3, # CRITICAL
        need_name="Fuel Cells",
        need_capacity=80
    )
    DeliveryPoint.objects.create(
        name="Point Gamma",
        x_coord=700,
        y_coord=800,
        priority_level=1, # LOW
        need_name="Emergency Kits",
        need_capacity=10
    )
    DeliveryPoint.objects.create(
        name="Point Epsilon",
        x_coord=500,
        y_coord=100,
        priority_level=2, # NORMAL
        need_name="Fuel Cells",
        need_capacity=30
    )

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
