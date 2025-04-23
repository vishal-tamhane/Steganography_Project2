from PIL import Image, PngImagePlugin
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import sys
import json
import numpy as np
import base64
import hashlib

# Cryptographic constants to match encoding
PBKDF2_ITERATIONS = 600000  # Must match encoding iterations
KEY_LENGTH = 32  # AES-256 key length

def calculate_checksum(data):
    """Calculate SHA-256 checksum of data"""
    return hashlib.sha256(data).hexdigest()

def safe_b64_decode(data):
    """Safely decode Base64 data with proper padding handling"""
    try:
        # Add padding if needed
        missing_padding = 4 - (len(data) % 4)
        if missing_padding < 4:
            data += '=' * missing_padding
        return base64.b64decode(data)
    except Exception as e:
        print(f"[DEBUG] Base64 decoding failed: {str(e)}", file=sys.stderr)
        print(f"[DEBUG] Data length: {len(data)}", file=sys.stderr)
        raise

def extract_lsb_cipher_hex(image_path):
    try:
        with Image.open(image_path) as img:
            # Verify image format and mode
            if img.format != 'PNG':
                raise ValueError("Invalid image format: must be PNG")
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Get image dimensions
            width, height = img.size
            pixels = np.array(img)
            
            # Extract LSBs from all channels (R, G, B)
            binary_message = ''.join(
                str(pixels[i, j, k] & 1)
                for i in range(height)
                for j in range(width)
                for k in range(3)
            )
            
            # Find the end marker
            end_marker = "1111111111111110"
            end_index = binary_message.find(end_marker)
            if end_index == -1:
                raise ValueError("End marker not found in extracted bits")
            
            # Extract the actual message (excluding end marker)
            binary_message = binary_message[:end_index]
            
            # Ensure binary message length is a multiple of 8
            padding_needed = (8 - (len(binary_message) % 8)) % 8
            binary_message = binary_message.ljust(len(binary_message) + padding_needed, '0')
            
            # Convert binary to bytes directly
            byte_data = bytes(int(binary_message[i:i+8], 2) for i in range(0, len(binary_message), 8))
            
            # Calculate checksum of extracted data
            checksum = calculate_checksum(byte_data)
            print(f"[DEBUG] Extracted data checksum: {checksum}", file=sys.stderr)
            print(f"[DEBUG] Extracted data length: {len(byte_data)} bytes", file=sys.stderr)
            
            # Return the bytes as hex
            return byte_data.hex()
            
    except Exception as e:
        print(f"EXTRACT_ERROR: {str(e)}", file=sys.stderr)
        raise

def decrypt_message_hex(cipher_hex, salt_hex, iv_hex, auth_tag_hex, password):
    try:
        # Convert hex metadata to bytes
        salt = bytes.fromhex(salt_hex)
        iv = bytes.fromhex(iv_hex)
        auth_tag = bytes.fromhex(auth_tag_hex)
        
        # Convert hex to bytes directly
        try:
            ciphertext = bytes.fromhex(cipher_hex)
            print(f"[DEBUG] Ciphertext length: {len(ciphertext)} bytes", file=sys.stderr)
            print(f"[DEBUG] Ciphertext (first 32 bytes): {ciphertext[:32].hex()}", file=sys.stderr)
        except Exception as e:
            print(f"[DEBUG] Hex decoding failed: {str(e)}", file=sys.stderr)
            print(f"[DEBUG] Hex input: {cipher_hex[:100]}...", file=sys.stderr)
            raise ValueError(f"Hex decoding failed: {str(e)}")
        
        # Enhanced debug logging
        print(f"\n=== Cryptographic Parameters ===", file=sys.stderr)
        print(f"[DEBUG] Password length: {len(password)}", file=sys.stderr)
        print(f"[DEBUG] Using salt: {salt_hex}", file=sys.stderr)
        print(f"[DEBUG] Using IV: {iv_hex}", file=sys.stderr)
        print(f"[DEBUG] Using auth tag: {auth_tag_hex}", file=sys.stderr)
        print(f"[DEBUG] PBKDF2 iterations: {PBKDF2_ITERATIONS}", file=sys.stderr)
        print(f"[DEBUG] Key length: {KEY_LENGTH}", file=sys.stderr)
        print(f"[DEBUG] Ciphertext length: {len(ciphertext)} bytes", file=sys.stderr)
        
        # Derive key using PBKDF2 with SHA256 - must match encoding parameters
        key = PBKDF2(
            password.encode('utf-8'),  # Ensure UTF-8 encoding
            salt,
            dkLen=KEY_LENGTH,
            count=PBKDF2_ITERATIONS,
            hmac_hash_module=SHA256
        )
        
        # Log derived key for debugging
        print(f"[DEBUG] Derived key: {key.hex()}", file=sys.stderr)
        
        # Create cipher object with PyCryptoDome
        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        
        # Final validation checks
        print(f"\n=== Final Validation Checks ===", file=sys.stderr)
        print(f"[FINAL CHECK] Ciphertext: {ciphertext.hex()}", file=sys.stderr)
        print(f"[FINAL CHECK] Tag: {auth_tag.hex()}", file=sys.stderr)
        print(f"[FINAL CHECK] Key: {key.hex()}", file=sys.stderr)
        print(f"[FINAL CHECK] IV: {iv.hex()}", file=sys.stderr)
        
        # Decrypt and verify with explicit tag handling
        try:
            # Proper authentication tag handling with PyCryptoDome
            plaintext = cipher.decrypt_and_verify(ciphertext, auth_tag)
            print(f"[DEBUG] Decryption successful", file=sys.stderr)
            print(f"[DEBUG] Decrypted length: {len(plaintext)} bytes", file=sys.stderr)
            
            # Calculate and log checksum of decrypted data
            decrypted_checksum = calculate_checksum(plaintext)
            print(f"[DEBUG] Decrypted data checksum: {decrypted_checksum}", file=sys.stderr)
            
            return plaintext.decode('utf-8')
        except ValueError as e:
            print(f"DECRYPT_ERROR: Authentication failed - {str(e)}", file=sys.stderr)
            print(f"[DEBUG] Failed cipher params: nonce={iv.hex()} | auth_tag={auth_tag.hex()}", file=sys.stderr)
            raise
    except Exception as e:
        print(f"DECRYPT_ERROR: {str(e)}", file=sys.stderr)
        raise

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python decode_Steg0.py <image> <password>", file=sys.stderr)
        sys.exit(1)

    _, image_path, password = sys.argv

    try:
        # Read metadata from the PNG
        with Image.open(image_path) as img:
            # Use img.text instead of img.info for consistency with encoding
            salt_hex = img.text.get('salt')
            iv_hex = img.text.get('iv')
            auth_tag_hex = img.text.get('authTag')
            
            if not all([salt_hex, iv_hex, auth_tag_hex]):
                print("DECODE_ERROR: Missing salt/iv/authTag in PNG metadata", file=sys.stderr)
                sys.exit(1)
            
            # Validate metadata lengths
            if len(salt_hex) != 32:
                raise ValueError(f"Invalid salt length: {len(salt_hex)} (expected 32)")
            if len(iv_hex) != 24:
                raise ValueError(f"Invalid IV length: {len(iv_hex)} (expected 24)")
            if len(auth_tag_hex) != 32:
                raise ValueError(f"Invalid auth tag length: {len(auth_tag_hex)} (expected 32)")
            
            # Echo metadata for debugging
            print(json.dumps({
                'salt': salt_hex,
                'iv': iv_hex,
                'authTag': auth_tag_hex
            }))
            
            # Extract and decrypt
            cipher_hex = extract_lsb_cipher_hex(image_path)
            plaintext = decrypt_message_hex(cipher_hex, salt_hex, iv_hex, auth_tag_hex, password)
            print(plaintext)
            
    except Exception as e:
        print(f"DECODE_ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1) 