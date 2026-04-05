from django.db import models
from django.contrib.auth.models import User

class DeliveryPoint(models.Model):
    name = models.CharField(max_length=100, help_text="Location name")
    
    x_coord = models.IntegerField()
    y_coord = models.IntegerField()

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
        REDIRECTED = 'REDIRECTED', 'Redirected'
        FULFILLED = 'FULFILLED', 'Fulfilled'

    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE, related_name='orders')
    
    urgency_level = models.IntegerField(choices=Urgency.choices, default=Urgency.NORMAL)
    quantity = models.IntegerField(default=0, help_text="How much needed")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
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