from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login, ChangePasswordView

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("change-password/", ChangePasswordView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]