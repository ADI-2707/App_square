from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login, logout, change_password

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("logout/", logout),
    path("change-password/", change_password),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]