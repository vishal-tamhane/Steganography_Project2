import sys
import os
import binascii
from PIL import Image
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import numpy as np
import base64

if len(sys.argv) != 6:
    print("Usage: decode_stego.py <image> <secret_key> <salt_hex> <iv_hex> <auth_tag_hex>", file=sys.stderr)
    sys.exit(1)

def binary_to_text(binary_str):
    """Convert a binary string to readable text."""
    try:
        # Split binary string into 8-bit chunks
        chars = [binary_str[i:i+8] for i in range(0, len(binary_str), 8)]
        # Convert each chunk to a character
        text = ''.join([chr(int(char, 2)) for char in chars])
        return text
    except Exception as e:
        print(f"Error in binary_to_text: {str(e)}", file=sys.stderr)
        raise

def extract_encrypted_data(image_path):
    """Extract encrypted data hidden in the least significant bits of image pixels."""
    try:
        # Open and convert image to RGB
        img = Image.open(image_path)
        img = img.convert("RGB")
        pixels = np.array(img, dtype=np.uint8)
        
        print(f"Image size: {pixels.shape[0]}x{pixels.shape[1]}", file=sys.stderr)
        
        binary_message = ""
        end_marker = "1111111111111110"  # Consistent end marker
        max_bits = pixels.shape[0] * pixels.shape[1] * 3  # Maximum bits that can be stored
        
        # Extract LSB from each RGB component
        for i in range(pixels.shape[0]):
            for j in range(pixels.shape[1]):
                for k in range(3):  # R, G, B channels
                    lsb = str(pixels[i, j, k] & 1)
                    binary_message += lsb
                    
                    # Check for end marker
                    if binary_message.endswith(end_marker):
                        binary_message = binary_message[:-len(end_marker)]
                        print(f"Extracted binary message (length: {len(binary_message)}): {binary_message[:100]}...", file=sys.stderr)
                        text = binary_to_text(binary_message)
                        print(f"Extracted text: {text}", file=sys.stderr)
                        return text
                    
                    # Check if we've exceeded image capacity
                    if len(binary_message) > max_bits:
                        raise ValueError("End marker not found within image capacity")
        
        raise ValueError("End marker not found in image")
    except Exception as e:
        print(f"Error extracting data: {str(e)}", file=sys.stderr)
        raise


def decode_image(image_path, secret_key, salt_hex, iv_hex, auth_tag_hex):
    """Decode and decrypt the hidden message from the image."""
    try:
        # Validate hex string lengths
        print(f"Parameter lengths - Salt: {len(salt_hex)} | IV: {len(iv_hex)} | AuthTag: {len(auth_tag_hex)}", file=sys.stderr)
        if len(salt_hex) != 32:
            raise ValueError(f"Invalid salt length: {len(salt_hex)} (expected 32)")
        if len(iv_hex) != 24:
            raise ValueError(f"Invalid IV length: {len(iv_hex)} (expected 24)")
        if len(auth_tag_hex) != 32:
            raise ValueError(f"Invalid auth tag length: {len(auth_tag_hex)} (expected 32)")
        
        # Convert hex strings to bytes with proper error handling
        try:
            salt = bytes.fromhex(salt_hex)
            iv = bytes.fromhex(iv_hex)
            auth_tag = bytes.fromhex(auth_tag_hex)
        except ValueError as e:
            raise ValueError(f"Invalid hex string: {str(e)}")
        
        # Verify IV length (must be 12 bytes for AES-GCM)
        if len(iv) != 12:
            raise ValueError(f"Invalid IV length: {len(iv)} bytes (expected 12)")
        
        # Derive key using explicit SHA-256
        key = PBKDF2(secret_key, salt, dkLen=32, count=100000, hmac_hash_module=SHA256)
        
        # Extract and decode the encrypted data
        encrypted_data = extract_encrypted_data(image_path)
        print(f"Extracted encrypted data: {encrypted_data}", file=sys.stderr)
        ciphertext = base64.b64decode(encrypted_data)
        print(f"Base64 decoded ciphertext (hex): {ciphertext.hex()}", file=sys.stderr)
        print(f"Extracted ciphertext length: {len(ciphertext)} bytes", file=sys.stderr)
        
        # Verify ciphertext length
        if len(ciphertext) == 0:
            raise ValueError("Empty ciphertext extracted from image")
        
        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        plaintext = cipher.decrypt_and_verify(ciphertext, auth_tag)
        print(plaintext.decode())
        return True
    except Exception as e:
        print(f"DECODE_ERROR: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    # Get command-line arguments
    image_path = os.path.abspath(sys.argv[1].replace('\\', '/'))
    secret_key = sys.argv[2]
    salt_hex = sys.argv[3]
    iv_hex = sys.argv[4]
    auth_tag_hex = sys.argv[5]
    
    # Run decoding process and exit with appropriate status
    success = decode_image(image_path, secret_key, salt_hex, iv_hex, auth_tag_hex)
    sys.exit(0 if success else 1)
