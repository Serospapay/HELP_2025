"""
/**
 * @file: views.py
 * @description: REST API для реєстрації, автентифікації та управління профілем користувачів.
 * @dependencies: rest_framework.generics, rest_framework.permissions, rest_framework_simplejwt.views
 * @created: 2025-11-08
 */
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, response, status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = serializer.generate_tokens(user)
        user_data = UserSerializer(user, context=self.get_serializer_context()).data
        headers = self.get_success_headers(user_data)
        return response.Response(
            {"user": user_data, "tokens": tokens},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    pass


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, context={"request": request})
        return response.Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)
from django.shortcuts import render

# Create your views here.
