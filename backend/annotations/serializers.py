# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import AnnotationImage, Polygon


class PolygonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Polygon
        fields = ["id", "image", "label", "points", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_points(self, value):
        if not isinstance(value, list) or len(value) < 3:
            raise serializers.ValidationError(
                "At least 3 points are required."
            )
        for point in value:
            if not isinstance(point, (list, tuple)) or len(point) != 2:
                raise serializers.ValidationError(
                    "Each point must be an [x, y] pair."
                )
            x, y = point
            if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0):
                raise serializers.ValidationError(
                    "Each coordinate must be in [0, 1]."
                )
        return value


class AnnotationImageListSerializer(serializers.ModelSerializer):
    polygons = PolygonSerializer(many=True, read_only=True)

    class Meta:
        model = AnnotationImage
        fields = [
            "id", "image", "original_filename",
            "width", "height", "uploaded_at", "polygons",
        ]


class AnnotationImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotationImage
        fields = [
            "id", "image", "original_filename",
            "width", "height", "uploaded_at",
        ]
        read_only_fields = ["id", "width", "height", "uploaded_at"]
