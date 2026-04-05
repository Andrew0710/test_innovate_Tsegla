from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DeliveryPoint', '0003_order_workflow_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('REJECTED', 'Rejected'),
                    ('REDIRECTED', 'Redirected'),
                    ('LOADING', 'Loading'),
                    ('FULFILLED', 'Fulfilled'),
                ],
                default='PENDING',
                max_length=20,
            ),
        ),
    ]
