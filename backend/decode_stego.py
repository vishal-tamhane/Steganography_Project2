from PIL import Image
import numpy as np
import sys
import hashlib
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

def binary_to_text(binary_str):
    chars = [binary_str[i:i+8] for i in range(0, len(binary_str), 8)]
    return ''.join([chr(int(char, 2)) for char in chars])

def decrypt_message(encrypted_message, key):
    try:
        # Decode the base64 message
        decoded = base64.b64decode(encrypted_message)
        # Extract IV and encrypted data
        iv = decoded[:16]
        encrypted = decoded[16:]
        # Create cipher object
        cipher = AES.new(key, AES.MODE_CBC, iv)
        # Decrypt the message
        decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)
        return decrypted.decode()
    except Exception as e:
        print(f"Decryption error: {str(e)}")
        raise ValueError("Invalid secret key or corrupted message")

def decode_image(image_path, secret_key, salt):
    try:
        # Validate inputs
        if not secret_key or len(secret_key) < 8:
            print("Error: Secret key must be at least 8 characters")
            return None
            
        if not salt:
            print("Error: Salt is required")
            return None

        # Derive key from secret key and salt
        try:
            key = hashlib.pbkdf2_hmac('sha256', secret_key.encode(), bytes.fromhex(salt), 100000, 32)
        except Exception as e:
            print(f"Key derivation error: {str(e)}")
            return None
        
        img = Image.open(image_path)
        img = img.convert("RGB")
        pixels = np.array(img)

        binary_message = ""
        end_marker = "1111111111111110"

        for i in range(pixels.shape[0]):
            for j in range(pixels.shape[1]):
                for k in range(3):  # R, G, B
                    lsb = str(pixels[i, j, k] & 1)
                    binary_message += lsb

                    if binary_message.endswith(end_marker):
                        # Remove the end marker before decoding
                        binary_message = binary_message[:-len(end_marker)]
                        encrypted_text = binary_to_text(binary_message)
                        try:
                            decrypted_text = decrypt_message(encrypted_text, key)
                            print(decrypted_text)
                            return decrypted_text
                        except ValueError as e:
                            print(f"Error: {str(e)}")
                            return None

        print("Error: End marker not found in image")
        return None
    except Exception as e:
        print(f"Error during decoding: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python decode_stego.py <encoded_image> <secret_key> <salt>")
        sys.exit(1)
    
    encoded_image = sys.argv[1]
    secret_key = sys.argv[2]
    salt = sys.argv[3]
    
    try:
        result = decode_image(encoded_image, secret_key, salt)
        if result is None:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
