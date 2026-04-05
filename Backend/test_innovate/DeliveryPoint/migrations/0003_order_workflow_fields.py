from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('DeliveryPoint', '0002_deliverypoint_current_stock_percent_order_quantity_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='approval_mode',
            field=models.CharField(
                choices=[('NONE', 'No decision yet'), ('AUTO', 'Auto-approved'), ('MANUAL', 'Manually approved')],
                default='NONE',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='decided_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='decided_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='decided_orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='order',
            name='decision_reason',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('REDIRECTED', 'Redirected'), ('LOADING', 'Loading'), ('FULFILLED', 'Fulfilled')], default='PENDING', max_length=20),
        ),
    ]
