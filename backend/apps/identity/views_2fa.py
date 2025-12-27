from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
import pyotp
import qrcode
import io
import base64

User = get_user_model()

class Enable2FAView(views.APIView):
    """
    Step 1 of enabling 2FA:
    - Generate a random secret.
    - Return the secret and a QR code (base64) for the authenticator app.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_2fa_enabled:
            return Response({"error": "2FA is already enabled."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a random secret if not exists or if checking again
        # We don't save it to the DB as 'confirmed' yet, but we can temporarily store it 
        # OR just generate it on the fly. However, we need to verify against THIS secret.
        # So usually we save it to the user but keep is_2fa_enabled=False until confirmed.
        
        if not user.two_factor_secret:
            secret = pyotp.random_base32()
            user.two_factor_secret = secret
            user.save()
        else:
            secret = user.two_factor_secret

        # Create OTP URI
        otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="OWLS Store"
        )

        # Generate QR Code
        qr = qrcode.make(otp_uri)
        img_buffer = io.BytesIO()
        qr.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode('utf-8')

        return Response({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{img_str}",
            "otp_uri": otp_uri
        })

class Confirm2FAView(views.APIView):
    """
    Step 2 of enabling 2FA:
    - User sends the code from their app.
    - valid -> set is_2fa_enabled = True.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get("code")

        if not code:
            return Response({"error": "OTP code is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.two_factor_secret:
            return Response({"error": "No 2FA setup started."}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(code):
            user.is_2fa_enabled = True
            user.two_factor_method = 'totp' # Defaulting to TOTP for now
            user.save()
            return Response({"message": "2FA has been successfully enabled."})
        else:
            return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)


class Login2FAView(views.APIView):
    """
    Step 2 of Login: Exchange temp_token + 2FA code for access/refresh tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
        from rest_framework_simplejwt.tokens import RefreshToken

        temp_token = request.data.get("temp_token")
        code = request.data.get("code")

        if not temp_token or not code:
            return Response({"error": "Token and code are required."}, status=status.HTTP_400_BAD_REQUEST)

        signer = TimestampSigner()
        try:
            # Token valid for 5 minutes (300 seconds)
            user_id = signer.unsign(temp_token, max_age=300)
            user = User.objects.get(id=user_id)
        except (BadSignature, SignatureExpired):
            return Response({"error": "Invalid or expired login session."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_2fa_enabled:
             return Response({"error": "2FA not enabled for this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify Code
        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(code):
            # Issue Tokens
            refresh = RefreshToken.for_user(user)
            from .serializers import UserSerializer
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            return Response({"error": "Invalid 2FA code."}, status=status.HTTP_400_BAD_REQUEST)


class Disable2FAView(views.APIView):
    """
    Disable 2FA. Requires password confirmation for security.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get("password")

        if not user.is_2fa_enabled:
            return Response({"error": "2FA is not enabled."}, status=status.HTTP_400_BAD_REQUEST)

        if not password or not user.check_password(password):
            return Response({"error": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_2fa_enabled = False
        user.two_factor_secret = None
        user.two_factor_method = None
        user.save()

        return Response({"message": "2FA has been disabled."})
