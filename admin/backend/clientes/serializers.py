from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    usuario_username = serializers.CharField(
        source="usuario.username", read_only=True
    )

    class Meta:
        model = Cliente
        fields = [
            "id",
            "usuario",
            "usuario_username",
            "username",
            "password",
            "nombre",
            "email",
            "telefono",
            "direccion",
            "rol",
            "permisos_extra",
            "creado_en",
        ]
        read_only_fields = ["usuario", "creado_en", "usuario_username"]

    def create(self, validated_data):
        username = validated_data.pop("username", None)
        password = validated_data.pop("password", None)

        if not username or not password:
            raise serializers.ValidationError(
                "Se requieren username y password para crear un usuario"
            )

        user = User.objects.create_user(
            username=username,
            email=validated_data.get("email"),
            password=password,
        )

        return Cliente.objects.create(usuario=user, **validated_data)

    def update(self, instance, validated_data):
        username = validated_data.pop("username", None)
        password = validated_data.pop("password", None)

        if username:
            instance.usuario.username = username
        if password:
            instance.usuario.set_password(password)
        if username or password:
            instance.usuario.save()

        return super().update(instance, validated_data)
