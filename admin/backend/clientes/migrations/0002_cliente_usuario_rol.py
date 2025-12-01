from django.db import migrations, models
from django.conf import settings
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clientes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='permisos_extra',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='cliente',
            name='rol',
            field=models.CharField(choices=[('Cliente', 'Cliente'), ('Admin', 'Admin'), ('SuperAdmin', 'SuperAdmin')], default='Cliente', max_length=20),
        ),
        migrations.AddField(
            model_name='cliente',
            name='usuario',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cliente', to=settings.AUTH_USER_MODEL),
        ),
    ]
