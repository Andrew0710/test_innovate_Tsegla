from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db import OperationalError, ProgrammingError, transaction
from django.utils import timezone

from DeliveryPoint.models import DeliveryPoint, EmployeeProfile, Order
from Warehouse.models import Product, Truck, Warehouse


DEMO_PASSWORD = 'demo12345'


@transaction.atomic
def ensure_demo_data(**kwargs):
    if not getattr(settings, 'AUTO_SEED_DEMO', True):
        return

    try:
        hub, _ = Warehouse.objects.get_or_create(
            name='Central Hub',
            defaults={
                'x_coord': 500,
                'y_coord': 500,
                'delivery_radius': 1000,
            },
        )
        north_station, _ = Warehouse.objects.get_or_create(
            name='North Station',
            defaults={
                'x_coord': 500,
                'y_coord': 900,
                'delivery_radius': 500,
            },
        )

        Product.objects.get_or_create(
            warehouse=hub,
            name='Fuel Cells',
            defaults={'count': 500, 'mass': 10},
        )
        Product.objects.get_or_create(
            warehouse=hub,
            name='Emergency Kits',
            defaults={'count': 200, 'mass': 5},
        )
        Product.objects.get_or_create(
            warehouse=north_station,
            name='Fuel Cells',
            defaults={'count': 100, 'mass': 10},
        )

        Truck.objects.get_or_create(
            warehouse=hub,
            capacity=1000,
            current_x=500,
            current_y=500,
            defaults={'current_load': 0, 'status': Truck.Status.STATIONARY},
        )
        Truck.objects.get_or_create(
            warehouse=hub,
            capacity=1500,
            current_x=250,
            current_y=350,
            defaults={'current_load': 800, 'status': Truck.Status.TO_ORDER},
        )
        Truck.objects.get_or_create(
            warehouse=north_station,
            capacity=800,
            current_x=500,
            current_y=900,
            defaults={'current_load': 0, 'status': Truck.Status.STATIONARY},
        )

        alpha, _ = DeliveryPoint.objects.get_or_create(
            name='Point Alpha',
            defaults={
                'x_coord': 200,
                'y_coord': 300,
                'priority_level': DeliveryPoint.Priority.CRITICAL,
                'need_name': 'Fuel Cells',
                'need_capacity': 50,
                'current_stock_percent': 12,
                'next_delivery': timezone.now() - timedelta(hours=2),
            },
        )
        beta, _ = DeliveryPoint.objects.get_or_create(
            name='Point Beta',
            defaults={
                'x_coord': 800,
                'y_coord': 200,
                'priority_level': DeliveryPoint.Priority.NORMAL,
                'need_name': 'Emergency Kits',
                'need_capacity': 20,
                'current_stock_percent': 46,
                'next_delivery': timezone.now() + timedelta(hours=3),
            },
        )
        delta, _ = DeliveryPoint.objects.get_or_create(
            name='Point Delta',
            defaults={
                'x_coord': 300,
                'y_coord': 700,
                'priority_level': DeliveryPoint.Priority.CRITICAL,
                'need_name': 'Fuel Cells',
                'need_capacity': 80,
                'current_stock_percent': 8,
                'next_delivery': timezone.now() - timedelta(hours=4),
            },
        )
        gamma, _ = DeliveryPoint.objects.get_or_create(
            name='Point Gamma',
            defaults={
                'x_coord': 700,
                'y_coord': 800,
                'priority_level': DeliveryPoint.Priority.LOW,
                'need_name': 'Emergency Kits',
                'need_capacity': 10,
                'current_stock_percent': 82,
                'next_delivery': timezone.now() + timedelta(hours=7),
            },
        )
        epsilon, _ = DeliveryPoint.objects.get_or_create(
            name='Point Epsilon',
            defaults={
                'x_coord': 500,
                'y_coord': 100,
                'priority_level': DeliveryPoint.Priority.NORMAL,
                'need_name': 'Fuel Cells',
                'need_capacity': 30,
                'current_stock_percent': 68,
                'next_delivery': timezone.now() + timedelta(hours=5),
            },
        )

        order_defaults = [
            {
                'delivery_point': alpha,
                'priority': DeliveryPoint.Priority.CRITICAL,
                'urgency_level': Order.Urgency.CRITICAL,
                'quantity': 70,
                'content': 'Urgent fuel reroute for hospital district',
                'status': Order.Status.PENDING,
            },
            {
                'delivery_point': delta,
                'priority': DeliveryPoint.Priority.CRITICAL,
                'urgency_level': Order.Urgency.CRITICAL,
                'quantity': 90,
                'content': 'Depot reserves depleted unexpectedly',
                'status': Order.Status.PENDING,
            },
            {
                'delivery_point': beta,
                'priority': DeliveryPoint.Priority.NORMAL,
                'urgency_level': Order.Urgency.NORMAL,
                'quantity': 25,
                'content': 'Planned replenishment',
                'status': Order.Status.REDIRECTED,
            },
            {
                'delivery_point': epsilon,
                'priority': DeliveryPoint.Priority.NORMAL,
                'urgency_level': Order.Urgency.LOW,
                'quantity': 15,
                'content': 'Non-urgent balancing',
                'status': Order.Status.FULFILLED,
            },
        ]

        for order_data in order_defaults:
            Order.objects.get_or_create(
                delivery_point=order_data['delivery_point'],
                content=order_data['content'],
                defaults={
                    'priority': order_data['priority'],
                    'urgency_level': order_data['urgency_level'],
                    'quantity': order_data['quantity'],
                    'status': order_data['status'],
                },
            )

        demo_users = [
            ('dispatcher_demo', EmployeeProfile.Role.DISPATCHER, alpha),
            ('driver_demo', EmployeeProfile.Role.OPERATOR, beta),
            ('manager_demo', EmployeeProfile.Role.MANAGER, delta),
        ]

        for username, role, workplace in demo_users:
            user, _ = User.objects.get_or_create(username=username)
            user.set_password(DEMO_PASSWORD)
            user.save(update_fields=['password'])
            EmployeeProfile.objects.update_or_create(
                user=user,
                defaults={'role': role, 'workplace': workplace},
            )

        _ = gamma
    except (OperationalError, ProgrammingError):
        # Post-migrate can fire before all app tables exist.
        return
