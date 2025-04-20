from PIL import Image
import numpy as np
import sys
import hashlib
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes

def text_to_binary(text):
    return ''.join(format(ord(char), '08b') for char in text)

def encrypt_message(message, key):
    # Generate a random IV
    iv = get_random_bytes(16)
    # Create cipher object
    cipher = AES.new(key, AES.MODE_CBC, iv)
    # Encrypt the message
    encrypted = cipher.encrypt(pad(message.encode(), AES.block_size))
    # Return IV + encrypted message
    return base64.b64encode(iv + encrypted).decode()

def encode_image(image_path, secret_message, output_path, salt):
    # Derive key from secret key and salt
    key = hashlib.pbkdf2_hmac('sha256', secret_message.encode(), salt.encode(), 100000, 32)
    
    # Encrypt the message
    encrypted_message = encrypt_message(secret_message, key)
    
    # Convert encrypted message to binary
    binary_message = text_to_binary(encrypted_message) + '1111111111111110'  # End marker
    
    img = Image.open(image_path)
    img = img.convert("RGB")  # Ensure it's in RGB mode
    pixels = np.array(img)
    
    binary_index = 0
    total_pixels = pixels.shape[0] * pixels.shape[1] * 3  # RGB channels
    
    if len(binary_message) > total_pixels:
        raise ValueError("Message too large to hide in this image.")

    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            for k in range(3):  # Iterate over R, G, B
                if binary_index < len(binary_message):
                    pixels[i, j, k] = (pixels[i, j, k] & 0xFE) | int(binary_message[binary_index])
                    binary_index += 1

    encoded_img = Image.fromarray(pixels)
    encoded_img.save(output_path)
    print(f"Message encoded and saved as {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python steg.py <input_image> <message> <output_image> <salt>")
        sys.exit(1)
    
    input_image = sys.argv[1]
    message = sys.argv[2]
    output_image = sys.argv[3]
    salt = sys.argv[4]
    
    try:
        encode_image(input_image, message, output_image, salt)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
