from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("images", views.AnnotationImageViewSet, basename="images")
router.register("polygons", views.PolygonViewSet, basename="polygons")
urlpatterns = router.urls
