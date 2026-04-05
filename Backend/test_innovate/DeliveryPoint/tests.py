from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth.models import User

from .models import DeliveryPoint, EmployeeProfile, Order


class OrderWorkflowTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.dispatcher = User.objects.create_user(username='dispatcher_test', password='demo12345')
		EmployeeProfile.objects.create(user=self.dispatcher, role=EmployeeProfile.Role.DISPATCHER)

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

	def test_critical_order_auto_approves_when_donor_exists(self):
		target = DeliveryPoint.objects.create(
			name='Target',
			x_coord=0,
			y_coord=0,
			priority_level=DeliveryPoint.Priority.CRITICAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=10,
		)
		DeliveryPoint.objects.create(
			name='Donor',
			x_coord=30,
			y_coord=30,
			priority_level=DeliveryPoint.Priority.LOW,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=90,
		)

		response = self.client.post(
			'/api/delivery/orders/',
			{
				'delivery_point': target.id,
				'priority': DeliveryPoint.Priority.CRITICAL,
				'urgency_level': Order.Urgency.CRITICAL,
				'quantity': 40,
				'content': 'Critical auto test',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['status'], Order.Status.REDIRECTED)
		self.assertEqual(response.data['approval_mode'], Order.ApprovalMode.AUTO)

	def test_normal_order_stays_pending_for_manual_approval(self):
		point = DeliveryPoint.objects.create(
			name='Manual Point',
			x_coord=5,
			y_coord=5,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Kits',
			need_capacity=100,
			current_stock_percent=40,
		)

		response = self.client.post(
			'/api/delivery/orders/',
			{
				'delivery_point': point.id,
				'priority': DeliveryPoint.Priority.NORMAL,
				'urgency_level': Order.Urgency.NORMAL,
				'quantity': 25,
				'content': 'Manual test',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['status'], Order.Status.PENDING)
		self.assertEqual(response.data['approval_mode'], Order.ApprovalMode.NONE)

	def test_only_dispatcher_can_approve_redirect(self):
		point = DeliveryPoint.objects.create(
			name='Approve Point',
			x_coord=10,
			y_coord=10,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=30,
		)
		order = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.PENDING,
		)

		no_auth_response = self.client.post(f'/api/delivery/orders/{order.id}/approve_redirect/', {}, format='json')
		self.assertEqual(no_auth_response.status_code, 403)

		self.client.force_authenticate(user=self.dispatcher)
		auth_response = self.client.post(
			f'/api/delivery/orders/{order.id}/approve_redirect/',
			{'reason': 'Dispatcher approved'},
			format='json',
		)
		self.assertEqual(auth_response.status_code, 200)
		self.assertEqual(auth_response.data['status'], Order.Status.REDIRECTED)
		self.assertEqual(auth_response.data['approval_mode'], Order.ApprovalMode.MANUAL)

	def test_point_requests_endpoint_returns_only_selected_point_orders(self):
		point_a = DeliveryPoint.objects.create(
			name='Point A',
			x_coord=1,
			y_coord=1,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=50,
			current_stock_percent=50,
		)
		point_b = DeliveryPoint.objects.create(
			name='Point B',
			x_coord=2,
			y_coord=2,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=50,
			current_stock_percent=60,
		)

		order_a = Order.objects.create(
			delivery_point=point_a,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=10,
		)
		Order.objects.create(
			delivery_point=point_b,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=10,
		)

		response = self.client.get(f'/api/delivery/points/{point_a.id}/requests/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], order_a.id)

	def test_dispatcher_can_move_redirected_order_to_loading(self):
		point = DeliveryPoint.objects.create(
			name='Loading Point',
			x_coord=3,
			y_coord=4,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=60,
			current_stock_percent=20,
		)
		order = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=15,
			status=Order.Status.REDIRECTED,
		)

		self.client.force_authenticate(user=self.dispatcher)
		response = self.client.post(f'/api/delivery/orders/{order.id}/mark_loading/', {}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], Order.Status.LOADING)

	def test_recommendations_include_only_undecided_pending_orders(self):
		point = DeliveryPoint.objects.create(
			name='Recommendations Point',
			x_coord=8,
			y_coord=8,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=30,
		)
		included = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.PENDING,
			approval_mode=Order.ApprovalMode.NONE,
		)
		manual_pending = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.PENDING,
			approval_mode=Order.ApprovalMode.MANUAL,
		)
		redirected = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.REDIRECTED,
			approval_mode=Order.ApprovalMode.MANUAL,
		)

		response = self.client.get('/api/delivery/orders/recommendations/')
		self.assertEqual(response.status_code, 200)
		response_ids = [item['id'] for item in response.data]
		self.assertIn(included.id, response_ids)
		self.assertNotIn(manual_pending.id, response_ids)
		self.assertNotIn(redirected.id, response_ids)

	def test_orders_support_status_query_filter(self):
		point = DeliveryPoint.objects.create(
			name='Filter Point',
			x_coord=9,
			y_coord=9,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=30,
		)
		pending = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=10,
			status=Order.Status.PENDING,
		)
		Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=10,
			status=Order.Status.REDIRECTED,
		)

		response = self.client.get('/api/delivery/orders/?status=PENDING')
		self.assertEqual(response.status_code, 200)
		response_ids = [item['id'] for item in response.data]
		self.assertIn(pending.id, response_ids)
		self.assertTrue(all(item['status'] == Order.Status.PENDING for item in response.data))

	def test_only_dispatcher_can_reject_undecided_pending_order(self):
		point = DeliveryPoint.objects.create(
			name='Reject Point',
			x_coord=7,
			y_coord=7,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=30,
		)
		order = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.PENDING,
			approval_mode=Order.ApprovalMode.NONE,
		)

		no_auth_response = self.client.post(f'/api/delivery/orders/{order.id}/reject_request/', {}, format='json')
		self.assertEqual(no_auth_response.status_code, 403)

		self.client.force_authenticate(user=self.dispatcher)
		auth_response = self.client.post(
			f'/api/delivery/orders/{order.id}/reject_request/',
			{'reason': 'Not needed now'},
			format='json',
		)
		self.assertEqual(auth_response.status_code, 200)
		self.assertEqual(auth_response.data['status'], Order.Status.REJECTED)
		self.assertEqual(auth_response.data['approval_mode'], Order.ApprovalMode.MANUAL)

	def test_cannot_reject_processed_order(self):
		point = DeliveryPoint.objects.create(
			name='Reject Guard Point',
			x_coord=6,
			y_coord=6,
			priority_level=DeliveryPoint.Priority.NORMAL,
			need_name='Fuel',
			need_capacity=100,
			current_stock_percent=30,
		)
		order = Order.objects.create(
			delivery_point=point,
			priority=DeliveryPoint.Priority.NORMAL,
			urgency_level=Order.Urgency.NORMAL,
			quantity=20,
			status=Order.Status.REDIRECTED,
			approval_mode=Order.ApprovalMode.MANUAL,
		)

		self.client.force_authenticate(user=self.dispatcher)
		response = self.client.post(f'/api/delivery/orders/{order.id}/reject_request/', {}, format='json')
		self.assertEqual(response.status_code, 400)
