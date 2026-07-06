from io import BytesIO

from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AnnotationImage, Polygon
from .serializers import (
    AnnotationImageListSerializer,
    AnnotationImageUploadSerializer,
    PolygonSerializer,
)


class AnnotationImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return AnnotationImageUploadSerializer
        return AnnotationImageListSerializer

    def get_queryset(self):
        return AnnotationImage.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        image_file = self.request.data.get("image")
        width, height = None, None
        if image_file:
            try:
                pil = Image.open(image_file)
                width, height = pil.size
            except Exception:
                pass
            original_filename = getattr(image_file, "name", "")
        else:
            original_filename = ""
        serializer.save(
            owner=self.request.user,
            width=width,
            height=height,
            original_filename=original_filename,
        )


class PolygonViewSet(viewsets.ModelViewSet):
    serializer_class = PolygonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Polygon.objects.filter(image__owner=self.request.user)
        image_id = self.request.query_params.get("image")
        if image_id:
            qs = qs.filter(image_id=image_id)
        return qs

    def perform_create(self, serializer):
        image_id = self.request.data.get("image")
        image = AnnotationImage.objects.get(id=image_id, owner=self.request.user)
        serializer.save(image=image)
