# === steg_encode.py ===

from PIL import Image, PngImagePlugin
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import numpy as np
import sys
import os

# Constants
PBKDF2_ITERATIONS = 100000
KEY_LENGTH = 32
DELIMITER = "1111111111111110"

def text_to_binary(text):
    return ''.join(format(ord(char), '08b') for char in text) + DELIMITER

def encrypt_message(message, password):
    salt = get_random_bytes(16)
    iv = get_random_bytes(12)
    key = PBKDF2(password.encode(), salt, KEY_LENGTH, count=PBKDF2_ITERATIONS, hmac_hash_module=SHA256)
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    ciphertext, auth_tag = cipher.encrypt_and_digest(message.encode())
    return ciphertext.hex(), salt.hex(), iv.hex(), auth_tag.hex()

def encode_image(input_path, ciphertext_hex, output_path, salt_hex, iv_hex, auth_tag_hex):
    try:
        # Validate input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input image not found: {input_path}")
            
        img = Image.open(input_path).convert('RGB')
        binary_message = text_to_binary(ciphertext_hex)

        pixels = np.array(img)
        h, w, _ = pixels.shape
        capacity = h * w * 3

        if len(binary_message) > capacity:
            raise ValueError(f"Message too large for image. Capacity: {capacity}, Required: {len(binary_message)}")

        index = 0
        for i in range(h):
            for j in range(w):
                for k in range(3):
                    if index < len(binary_message):
                        pixels[i, j, k] = (pixels[i, j, k] & 0xFE) | int(binary_message[index])
                        index += 1

        encoded_img = Image.fromarray(pixels)
        pnginfo = PngImagePlugin.PngInfo()
        pnginfo.add_text("salt", salt_hex)
        pnginfo.add_text("iv", iv_hex)
        pnginfo.add_text("authTag", auth_tag_hex)
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        encoded_img.save(output_path, "PNG", pnginfo=pnginfo)
        return True
    except Exception as e:
        print(f"Encoding failed: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="LSB Steganography Encoder")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output image path")
    parser.add_argument("message", help="Message to hide")
    parser.add_argument("password", help="Password")
    args = parser.parse_args()

    # Validate inputs
    if not args.message.strip():
        print("Error: Message cannot be empty", file=sys.stderr)
        sys.exit(1)
        
    if not args.password.strip():
        print("Error: Password cannot be empty", file=sys.stderr)
        sys.exit(1)

    try:
        ciphertext_hex, salt, iv, auth_tag = encrypt_message(args.message, args.password)
        success = encode_image(args.input, ciphertext_hex, args.output, salt, iv, auth_tag)
        if success:
            print(f"Successfully encoded message into {args.output}")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)