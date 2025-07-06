# === steg_decode.py ===

from PIL import Image
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import numpy as np
import sys

# Constants
PBKDF2_ITERATIONS = 100000
KEY_LENGTH = 32
DELIMITER = "1111111111111110"

def binary_to_text(binary):
    chars = [binary[i:i+8] for i in range(0, len(binary), 8)]
    return ''.join(chr(int(b, 2)) for b in chars if len(b) == 8)

def decrypt_message(ciphertext_hex, password, salt_hex, iv_hex, auth_tag_hex):
    try:
        salt = bytes.fromhex(salt_hex)
        iv = bytes.fromhex(iv_hex)
        auth_tag = bytes.fromhex(auth_tag_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)
        key = PBKDF2(password.encode(), salt, KEY_LENGTH, count=PBKDF2_ITERATIONS, hmac_hash_module=SHA256)
        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        plaintext = cipher.decrypt_and_verify(ciphertext, auth_tag)
        return plaintext.decode()
    except Exception as e:
        return f"[ERROR] Decryption failed: {e}"

def decode_image(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
        pixels = np.array(img)

        bits = []
        for i in range(pixels.shape[0]):
            for j in range(pixels.shape[1]):
                for k in range(3):
                    bits.append(str(pixels[i, j, k] & 1))

        bitstring = ''.join(bits)
        end_index = bitstring.find(DELIMITER)
        if end_index == -1:
            raise ValueError("No delimiter found")

        binary_message = bitstring[:end_index]
        recovered_text = binary_to_text(binary_message)

        # Fix: Use img.info instead of img.text for PNG metadata
        metadata = img.info
        salt_hex = metadata.get("salt")
        iv_hex = metadata.get("iv")
        auth_tag_hex = metadata.get("authTag")

        if not (salt_hex and iv_hex and auth_tag_hex):
            raise ValueError("Missing cryptographic metadata")

        return recovered_text, salt_hex, iv_hex, auth_tag_hex
    except Exception as e:
        return f"[ERROR] Decoding failed: {e}", None, None, None

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="LSB Steganography Decoder")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("password", help="Password")
    args = parser.parse_args()

    # Validate inputs
    if not args.password.strip():
        print("Error: Password cannot be empty", file=sys.stderr)
        sys.exit(1)

    try:
        recovered, salt, iv, auth_tag = decode_image(args.input)
        if recovered.startswith("[ERROR]"):
            print(recovered, file=sys.stderr)
            sys.exit(1)
        plaintext = decrypt_message(recovered, args.password, salt, iv, auth_tag)
        if plaintext.startswith("[ERROR]"):
            print(plaintext, file=sys.stderr)
            sys.exit(1)
        print("Recovered message:", plaintext)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)