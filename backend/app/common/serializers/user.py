from django.contrib.auth import get_user_model, authenticate

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    email = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = get_user_model()
        fields = [
            "pk",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "profile_image",
        ]
        extra_kwargs = {
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
            "email": {"allow_blank": True},
            "username": {"required": True, "allow_blank": False},
            "is_staff": {"required": False, "default": False},
            "password": {"write_only": True},
        }

    def save(self, **kwargs):
        self.instance = super().save(**kwargs)
        return self.instance

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        print(data)
        user = authenticate(**data)
        print(user)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")
