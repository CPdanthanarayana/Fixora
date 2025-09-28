from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import status

# Token Refresh (use built-in SimpleJWT view)
class CustomTokenRefreshView(TokenRefreshView):
    pass

# Register View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


# Login View (JWT)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Both email and password are required"},
                status=400
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "No account found with this email"},
                status=400
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid password"},
                status=400
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })

# Logout (Blacklist refresh token)
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # invalidate the token
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

# Profile View (Protected)
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
