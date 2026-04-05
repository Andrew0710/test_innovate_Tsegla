from django.apps import AppConfig


class DeliverypointConfig(AppConfig):
    name = 'DeliveryPoint'

    def ready(self):
        from django.db.models.signals import post_migrate

        from .bootstrap import ensure_demo_data

        post_migrate.connect(
            ensure_demo_data,
            dispatch_uid='deliverypoint.ensure_demo_data',
        )
