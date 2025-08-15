from django.contrib.auth import get_user_model

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    groups_csv = serializers.CharField(required=False)
    email = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = get_user_model()
        fields = [
            "pk",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
        ]
        extra_kwargs = {
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
            "land_phone": {"allow_blank": True},
            "cell_phone": {"allow_blank": True},
        }

    def save(self, **kwargs):
        self.instance = super().save(**kwargs)
        return self.instance
