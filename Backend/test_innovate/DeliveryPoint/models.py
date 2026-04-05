from django.db import models
from django.contrib.auth.models import User

class DeliveryPoint(models.Model):
    name = models.CharField(max_length=100, help_text="Location name")
    
    x_coord = models.IntegerField()
    y_coord = models.IntegerField()

    class Priority(models.IntegerChoices):
        LOW = 1, 'Low'
        NORMAL = 2, 'Normal'
        CRITICAL = 3, 'Critical'

    priority_level = models.IntegerField(choices=Priority.choices, default=Priority.NORMAL)
    need_name = models.CharField(max_length=100, help_text="What needed", default="")
    need_capacity = models.IntegerField(default=0, help_text="How much needed")
    next_delivery = models.DateTimeField(null=True, blank=True, help_text="Next delivery time")

    current_stock_percent = models.IntegerField(default=100, help_text="Current stock percentage (0-100)")

    def __str__(self):
        return f"{self.name} (Stock: {self.current_stock_percent}%)"


class Order(models.Model):
    class Urgency(models.IntegerChoices):
        LOW = 1, 'Low'
        NORMAL = 2, 'Normal'
        CRITICAL = 3, 'Critical'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        REJECTED = 'REJECTED', 'Rejected'
        REDIRECTED = 'REDIRECTED', 'Redirected'
        LOADING = 'LOADING', 'Loading'
        FULFILLED = 'FULFILLED', 'Fulfilled'

    class ApprovalMode(models.TextChoices):
        NONE = 'NONE', 'No decision yet'
        AUTO = 'AUTO', 'Auto-approved'
        MANUAL = 'MANUAL', 'Manually approved'

    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE, related_name='orders')

    priority = models.IntegerField(choices=DeliveryPoint.Priority.choices, default=DeliveryPoint.Priority.NORMAL)
    content = models.TextField(help_text='Products description', default='')
    
    urgency_level = models.IntegerField(choices=Urgency.choices, default=Urgency.NORMAL)
    quantity = models.IntegerField(default=0, help_text="How much needed")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approval_mode = models.CharField(max_length=20, choices=ApprovalMode.choices, default=ApprovalMode.NONE)
    decision_reason = models.CharField(max_length=255, blank=True, default='')
    decided_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='decided_orders')
    decided_at = models.DateTimeField(null=True, blank=True)
    
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} for {self.delivery_point.name} - {self.get_status_display()}"
    
class EmployeeProfile(models.Model):
    class Role(models.TextChoices):
        DISPATCHER = 'DISPATCHER', 'Dispatcher'
        OPERATOR = 'OPERATOR', 'Operator'
        MANAGER = 'MANAGER', 'Manager'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OPERATOR)
    
    workplace = models.ForeignKey(DeliveryPoint, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"