from PIL import Image, PngImagePlugin
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import sys
import binascii
import numpy as np
import base64

if len(sys.argv) != 5:
    print("Usage: steg.py <input> <message> <output> <secret_key>", file=sys.stderr)
    sys.exit(1)

def text_to_binary(text):
    binary = ''.join(format(ord(char), '08b') for char in text)
    return binary + "1111111111111110"

def encrypt_message(message, key):
    try:
        salt = get_random_bytes(16)
        iv = get_random_bytes(12)
        derived_key = PBKDF2(key, salt, 32, 100000, hmac_hash_module=SHA256)
        cipher = AES.new(derived_key, AES.MODE_GCM, nonce=iv)
        ciphertext, auth_tag = cipher.encrypt_and_digest(message.encode())
        encrypted_data = base64.b64encode(ciphertext).decode()
        return encrypted_data, salt.hex(), iv.hex(), auth_tag.hex()
    except Exception as e:
        print(f"Error in encrypt_message: {str(e)}", file=sys.stderr)
        raise

def encode_lsb(image_path, binary_message, output_path, pnginfo=None):
    try:
        img = Image.open(image_path)
        img = img.convert("RGB")
        pixels = np.array(img, dtype=np.uint8)
        
        max_capacity = pixels.shape[0] * pixels.shape[1] * 3
        if len(binary_message) > max_capacity:
            raise ValueError(f"Message too large for image: {len(binary_message)} bits > {max_capacity} capacity")
        
        print(f"Image size: {pixels.shape[0]}x{pixels.shape[1]}, Capacity: {max_capacity} bits")
        print(f"Encoding binary message (length: {len(binary_message)}): {binary_message[:100]}...")
        
        index = 0
        for i in range(pixels.shape[0]):
            for j in range(pixels.shape[1]):
                for k in range(3):
                    if index < len(binary_message):
                        pixels[i, j, k] = (pixels[i, j, k] & 0xFE) | int(binary_message[index])
                        index += 1
        
        encoded_img = Image.fromarray(pixels, mode="RGB")
        print(f"Saving image to {output_path} with metadata: {pnginfo.chunks if pnginfo else None}")
        encoded_img.save(output_path, "PNG", pnginfo=pnginfo, compress_level=0)
        
        saved_img = Image.open(output_path)
        saved_info = saved_img.info
        print(f"Metadata in saved image: {saved_info}")
    except Exception as e:
        print(f"Error in encode_lsb: {str(e)}", file=sys.stderr)
        raise

def encode_image(input_path, message, output_path, secret_key):
    try:
        print(f"Input message: {message}")
        encrypted_data, salt_hex, iv_hex, auth_tag_hex = encrypt_message(message, secret_key)
        print(f"Encrypted data: {encrypted_data}, salt: {salt_hex}, iv: {iv_hex}, authTag: {auth_tag_hex}")
        
        binary_message = text_to_binary(encrypted_data)
        
        pnginfo = PngImagePlugin.PngInfo()
        pnginfo.add_itxt("salt", salt_hex, lang="en", tkey="salt")
        pnginfo.add_itxt("iv", iv_hex, lang="en", tkey="iv")
        pnginfo.add_itxt("authTag", auth_tag_hex, lang="en", tkey="authTag")
        print(f"Created PNG iTXt metadata: salt={salt_hex}, iv={iv_hex}, authTag={auth_tag_hex}")
        
        encode_lsb(input_path, binary_message, output_path, pnginfo)
        return True
    except Exception as e:
        print(f"ENCODE_ERROR: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = encode_image(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    sys.exit(0 if success else 1)
