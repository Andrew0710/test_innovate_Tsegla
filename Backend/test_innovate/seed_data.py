import os
import django
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'test_innovate.settings')
django.setup()

from Warehouse.models import Warehouse, Product, Truck
from DeliveryPoint.models import DeliveryPoint, Order, EmployeeProfile
from django.utils import timezone
from django.contrib.auth.models import User

def seed():
    # Clear existing data
    Order.objects.all().delete()
    DeliveryPoint.objects.all().delete()
    Truck.objects.all().delete()
    Product.objects.all().delete()
    Warehouse.objects.all().delete()
    EmployeeProfile.objects.all().delete()
    User.objects.filter(username__in=['dispatcher_demo', 'driver_demo', 'manager_demo']).delete()

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
    alpha = DeliveryPoint.objects.create(
        name="Point Alpha",
        x_coord=200,
        y_coord=300,
        priority_level=3, # CRITICAL
        need_name="Fuel Cells",
        need_capacity=50,
        current_stock_percent=12,
        next_delivery=timezone.now() - timedelta(hours=2)
    )
    beta = DeliveryPoint.objects.create(
        name="Point Beta",
        x_coord=800,
        y_coord=200,
        priority_level=2, # NORMAL
        need_name="Emergency Kits",
        need_capacity=20,
        current_stock_percent=46,
        next_delivery=timezone.now() + timedelta(hours=3)
    )
    delta = DeliveryPoint.objects.create(
        name="Point Delta",
        x_coord=300,
        y_coord=700,
        priority_level=3, # CRITICAL
        need_name="Fuel Cells",
        need_capacity=80,
        current_stock_percent=8,
        next_delivery=timezone.now() - timedelta(hours=4)
    )
    gamma = DeliveryPoint.objects.create(
        name="Point Gamma",
        x_coord=700,
        y_coord=800,
        priority_level=1, # LOW
        need_name="Emergency Kits",
        need_capacity=10,
        current_stock_percent=82,
        next_delivery=timezone.now() + timedelta(hours=7)
    )
    epsilon = DeliveryPoint.objects.create(
        name="Point Epsilon",
        x_coord=500,
        y_coord=100,
        priority_level=2, # NORMAL
        need_name="Fuel Cells",
        need_capacity=30,
        current_stock_percent=68,
        next_delivery=timezone.now() + timedelta(hours=5)
    )

    # 5. Create Orders for demo cross-page interactions
    Order.objects.create(
        delivery_point=alpha,
        priority=DeliveryPoint.Priority.CRITICAL,
        urgency_level=Order.Urgency.CRITICAL,
        quantity=70,
        content="Urgent fuel reroute for hospital district",
        status=Order.Status.PENDING,
    )
    Order.objects.create(
        delivery_point=delta,
        priority=DeliveryPoint.Priority.CRITICAL,
        urgency_level=Order.Urgency.CRITICAL,
        quantity=90,
        content="Depot reserves depleted unexpectedly",
        status=Order.Status.PENDING,
    )
    Order.objects.create(
        delivery_point=beta,
        priority=DeliveryPoint.Priority.NORMAL,
        urgency_level=Order.Urgency.NORMAL,
        quantity=25,
        content="Planned replenishment",
        status=Order.Status.REDIRECTED,
    )
    Order.objects.create(
        delivery_point=epsilon,
        priority=DeliveryPoint.Priority.NORMAL,
        urgency_level=Order.Urgency.LOW,
        quantity=15,
        content="Non-urgent balancing",
        status=Order.Status.FULFILLED,
    )

    # 6. Create demo users for JWT login
    dispatcher = User.objects.create_user(username='dispatcher_demo', password='demo12345')
    driver = User.objects.create_user(username='driver_demo', password='demo12345')
    manager = User.objects.create_user(username='manager_demo', password='demo12345')

    EmployeeProfile.objects.create(
        user=dispatcher,
        role=EmployeeProfile.Role.DISPATCHER,
        workplace=alpha,
    )
    EmployeeProfile.objects.create(
        user=driver,
        role=EmployeeProfile.Role.OPERATOR,
        workplace=beta,
    )
    EmployeeProfile.objects.create(
        user=manager,
        role=EmployeeProfile.Role.MANAGER,
        workplace=delta,
    )

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
