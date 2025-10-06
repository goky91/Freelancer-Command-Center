from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ClientViewSet, TimeEntryViewSet, InvoiceViewSet,
    RegisterView, current_user
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'time-entries', TimeEntryViewSet, basename='timeentry')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view({'post': 'register'}), name='register'),
    path('auth/me/', current_user, name='current_user'),

    # API endpoints
    path('', include(router.urls)),
]
