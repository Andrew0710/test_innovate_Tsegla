from django.db import models

# Create your models here.

class Warehouse(models.Model):
    name = models.CharField(max_length=100, help_text="Name or identifier of a warehouse")
    
    x_coord = models.IntegerField()
    y_coord = models.IntegerField()
    
    delivery_radius = models.IntegerField()

    def __str__(self):
        return f"Warehouse: {self.name}"
    
class Product(models.Model):
    warehouse = models.ForeignKey(Warehouse, related_name='products', on_delete=models.CASCADE)
    
    name = models.CharField(max_length=100, help_text="Name of a product")
    count = models.IntegerField(default=0)
    mass = models.IntegerField(help_text="Mass of one unit or total mass")

    def __str__(self):
        return f"{self.name} (Quantity: {self.count}) in {self.warehouse.name}"
    
class Truck(models.Model):
    class Status(models.IntegerChoices):
        STATIONARY = 0, 'In stock'
        TO_ORDER = 1, 'Goes to order'
        RETURNING = 2, 'Returning'

    warehouse = models.ForeignKey('Warehouse', on_delete=models.CASCADE, related_name='truck_units')
    
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.STATIONARY
    )
    
    capacity = models.IntegerField(help_text="Maximum load capacity")
    current_load = models.IntegerField(default=0, help_text="Current weight of goods in the truck")
    
    current_x = models.IntegerField()
    current_y = models.IntegerField()

    @property
    def is_full(self):
        return self.current_load >= self.capacity

    def __str__(self):
        return f"Truck {self.id} ({self.get_status_display()})"