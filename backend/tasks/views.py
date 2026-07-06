from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer, ReorderSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.filter(owner=self.request.user)
        due_date = self.request.query_params.get("due_date")
        if due_date:
            qs = qs.filter(due_date=due_date)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ordered_ids = serializer.validated_data["ordered_ids"]
        status_val = serializer.validated_data["status"]
        tasks = Task.objects.filter(owner=request.user, id__in=ordered_ids)
        task_map = {t.id: t for t in tasks}
        for idx, tid in enumerate(ordered_ids):
            if tid in task_map:
                task = task_map[tid]
                task.position = idx
                task.status = status_val
        Task.objects.bulk_update(tasks, ["position", "status"])
        return Response({"status": "ok"})
