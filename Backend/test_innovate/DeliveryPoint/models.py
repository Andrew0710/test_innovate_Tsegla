from django.db import models

class DeliveryPoint(models.Model):
    class Priority(models.IntegerChoices):
        LOW = 1, 'Low'
        NORMAL = 2, 'Normal'
        CRITICAL = 3, 'Critical'

    name = models.CharField(max_length=100, help_text="Location name")
    
    x_coord = models.IntegerField()
    y_coord = models.IntegerField()
    
    priority_level = models.IntegerField(choices=Priority.choices, default=Priority.NORMAL)
    
    need_name = models.CharField(max_length=100, help_text="What needed")
    need_capacity = models.IntegerField(default=0, help_text="How much needed")
    
    next_delivery = models.DateTimeField(null=True, blank=True, help_text="Next delivery time")

    def __str__(self):
        return f"{self.name} (Priority: {self.get_priority_level_display()})"


class Order(models.Model):
    class Priority(models.IntegerChoices):
        LOW = 1, 'Low'
        NORMAL = 2, 'Normal'
        CRITICAL = 3, 'Critical'

    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE, related_name='orders')
    priority = models.IntegerField(choices=Priority.choices, default=Priority.NORMAL)
    
    # Час створення замовлення
    time = models.DateTimeField(auto_now_add=True)
    
    content = models.TextField(help_text="Products description")

    def __str__(self):
        return f"Order #{self.id} for {self.delivery_point.name}"