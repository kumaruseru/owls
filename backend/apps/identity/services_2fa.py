import pyotp
import qrcode
import io
import base64
import secrets
from django.conf import settings

class TwoFactorService:
    @staticmethod
    def generate_secret():
        """Generates a random base32 secret."""
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(user, secret):
        """Generates the otpauth URI for the authenticator app."""
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="OWLS Store"
        )

    @staticmethod
    def generate_qr_code(uri):
        """Generates a base64 encoded QR code image from the URI."""
        qr = qrcode.make(uri)
        img_buffer = io.BytesIO()
        qr.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    def verify_totp(secret, code):
        """Verifies a TOTP code against the secret."""
        if not secret:
            return False
        totp = pyotp.TOTP(secret)
        return totp.verify(code)

    @staticmethod
    def generate_backup_codes(count=10, length=10):
        """Generates a list of random backup codes."""
        codes = []
        for _ in range(count):
            # Generate a random hex string
            token = secrets.token_hex(length // 2)
            codes.append(token)
        return codes

    @staticmethod
    def verify_backup_code(user, code):
        """
        Verifies if the code is in the user's backup codes.
        If found, removes it (one-time use) and saves the user.
        Returns True if valid, False otherwise.
        """
        if not user.backup_codes:
            return False
        
        if code in user.backup_codes:
            user.backup_codes.remove(code)
            user.save(update_fields=['backup_codes'])
            return True
        return False
