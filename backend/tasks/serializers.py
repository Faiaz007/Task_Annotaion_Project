from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "status", "priority",
            "due_date", "tags", "position", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "position"]


class ReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())
    status = serializers.ChoiceField(choices=Task.Status.choices)
