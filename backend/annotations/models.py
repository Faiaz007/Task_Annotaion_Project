# pyrefly: ignore [missing-import]
from django.conf import settings
from django.db import models


class AnnotationImage(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="uploads/")
    original_filename = models.CharField(max_length=255, blank=True)
    width = models.PositiveIntegerField(null=True)
    height = models.PositiveIntegerField(null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename or f"Image {self.id}"


class Polygon(models.Model):
    image = models.ForeignKey(
        AnnotationImage, on_delete=models.CASCADE, related_name="polygons"
    )
    label = models.CharField(max_length=255, blank=True)
    points = models.JSONField()
    color = models.CharField(max_length=7, default="#3b82f6")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Polygon {self.id} on {self.image}"
