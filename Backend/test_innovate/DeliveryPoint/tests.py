from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import DeliveryPoint, Order


class OrderWorkflowTests(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_recommendations_are_ranked_by_priority_score(self):
		high_need = DeliveryPoint.objects.create(
			name='High Need',
			x_coord=0,
			y_coord=0,
			priority_level=DeliveryPoint.Priority.CRITICAL,
			need_name='Fuel',
			need_capacity=50,
			current_stock_percent=10,
			next_delivery=timezone.now() - timedelta(hours=3),
		)
		low_need = DeliveryPoint.objects.create(
			name='Low Need',
			x_coord=10,
			y_coord=10,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=65,
			next_delivery=timezone.now() + timedelta(hours=2),
		)

		top_order = Order.objects.create(
			delivery_point=high_need,
			priority=DeliveryPoint.Priority.CRITICAL,
			urgency_level=Order.Urgency.CRITICAL,
			quantity=70,
			status=Order.Status.PENDING,
		)
		Order.objects.create(
			delivery_point=low_need,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.LOW,
			quantity=15,
			status=Order.Status.PENDING,
		)

		response = self.client.get('/api/delivery/orders/recommendations/')
		self.assertEqual(response.status_code, 200)
		self.assertGreaterEqual(len(response.data), 2)
		self.assertEqual(response.data[0]['id'], top_order.id)
		self.assertGreater(response.data[0]['priority_score'], response.data[1]['priority_score'])

	def test_fulfill_updates_order_and_delivery_point(self):
		point = DeliveryPoint.objects.create(
			name='Fulfill Point',
			x_coord=20,
			y_coord=20,
			priority_level=DeliveryPoint.Priority.CRITICAL,
			need_name='Emergency Kits',
			need_capacity=100,
			current_stock_percent=10,
		)
		order = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.CRITICAL,
			urgency_level=Order.Urgency.CRITICAL,
			quantity=30,
			status=Order.Status.REDIRECTED,
		)

		response = self.client.post(
			f'/api/delivery/orders/{order.id}/fulfill/',
			{'delivered_quantity': 30},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		order.refresh_from_db()
		point.refresh_from_db()

		self.assertEqual(order.status, Order.Status.FULFILLED)
		self.assertEqual(point.current_stock_percent, 40)
		self.assertEqual(point.priority_level, DeliveryPoint.Priority.NORMAL)
