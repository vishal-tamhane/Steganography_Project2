from PIL import Image, PngImagePlugin
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
import sys
import binascii
import numpy as np
import base64
import os
import re

def text_to_binary(text):
    binary = ''.join(format(ord(char), '08b') for char in text)
    return binary + "1111111111111110"

def encrypt_message(message, key):
    try:
        salt = get_random_bytes(16)
        iv = get_random_bytes(12)  # 12 bytes for AES-GCM
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
        
        print(f"Image size: {pixels.shape[0]}x{pixels.shape[1]}, Capacity: {max_capacity} bits", file=sys.stderr)
        print(f"Encoding binary message (length: {len(binary_message)}): {binary_message[:100]}...", file=sys.stderr)
        
        index = 0
        for i in range(pixels.shape[0]):
            for j in range(pixels.shape[1]):
                for k in range(3):
                    if index < len(binary_message):
                        pixels[i, j, k] = (pixels[i, j, k] & 0xFE) | int(binary_message[index])
                        index += 1
        
        encoded_img = Image.fromarray(pixels, mode="RGB")
        print(f"Saving image to {output_path} with metadata: {pnginfo.chunks if pnginfo else None}", file=sys.stderr)
        encoded_img.save(output_path, "PNG", pnginfo=pnginfo, compress_level=0)
        
        # Verify the saved image
        verify_encoded_image(output_path)
    except Exception as e:
        print(f"Error in encode_lsb: {str(e)}", file=sys.stderr)
        raise

def verify_encoded_image(path):
    """Verify the encoded image's integrity and metadata."""
    try:
        with Image.open(path) as img:
            img.verify()  # PIL's built-in verification
            
            # Check critical PNG chunks
            if not img.text.get('salt') or not img.text.get('iv') or not img.text.get('authTag'):
                raise ValueError("Missing cryptographic metadata")
            
            # Verify image format and mode
            if img.format != 'PNG':
                raise ValueError("Invalid image format")
            if img.mode != 'RGB':
                raise ValueError("Invalid image mode")
            
            print("Image verification successful", file=sys.stderr)
        return True
    except Exception as e:
        print(f"Image verification failed: {str(e)}", file=sys.stderr)
        if os.path.exists(path):
            os.remove(path)
        raise

def verify_image_save(output_path):
    try:
        with Image.open(output_path) as img:
            img.verify()  # Check if it's a valid image
        # Reopen after verify (verify() leaves file in unusable state)
        with Image.open(output_path) as img:
            img.load()  # Force actual image loading
        print("Image verification passed.")  # stdout by default
        return True
    except Exception as e:
        print(f" Image verification failed: {e}", file=sys.stderr)
        return False

def encode_image(input_path, encrypted_data, output_path, salt_hex, iv_hex, auth_tag_hex):
    temp_path = output_path + '.tmp'
    
    try:
        # Log input parameters
        print(f"\n=== Starting Image Encoding ===")
        print(f"Input path: {input_path}")
        print(f"Output path: {output_path}")
        print(f"Temp path: {temp_path}")
        print(f"Encrypted data length: {len(encrypted_data)}")
        
        # 1. Verify input image
        if not verify_image_save(input_path):
            raise ValueError("Input image verification failed")
        
        # 2. Process image
        with Image.open(input_path) as img:
            # Log image details
            print(f"\n=== Image Details ===")
            print(f"Original mode: {img.mode}")
            print(f"Original size: {img.size}")
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
                print(f"Converted to RGB mode")
            
            # Validate hex string lengths and format
            print(f"\n=== Metadata Validation ===")
            print(f"Salt (hex): {salt_hex} (length: {len(salt_hex)})")
            print(f"IV (hex): {iv_hex} (length: {len(iv_hex)})")
            print(f"Auth Tag (hex): {auth_tag_hex} (length: {len(auth_tag_hex)})")
            
            if len(salt_hex) != 32:  # 16 bytes
                raise ValueError(f"Invalid salt length: {len(salt_hex)} (expected 32)")
            if len(iv_hex) != 24:    # 12 bytes
                raise ValueError(f"Invalid IV length: {len(iv_hex)} (expected 24)")
            if len(auth_tag_hex) != 32:  # 16 bytes
                raise ValueError(f"Invalid auth tag length: {len(auth_tag_hex)} (expected 32)")
            
            # Validate hex format
            hex_regex = r'^[0-9a-fA-F]+$'
            if not re.match(hex_regex, salt_hex):
                raise ValueError("Invalid salt format: not a valid hex string")
            if not re.match(hex_regex, iv_hex):
                raise ValueError("Invalid IV format: not a valid hex string")
            if not re.match(hex_regex, auth_tag_hex):
                raise ValueError("Invalid auth tag format: not a valid hex string")
            
            # Convert encrypted data to binary
            binary_message = text_to_binary(encrypted_data)
            
            # Get image dimensions and validate capacity
            pixels = np.array(img, dtype=np.uint8)
            max_capacity = pixels.shape[0] * pixels.shape[1] * 3
            if len(binary_message) > max_capacity:
                raise ValueError(f"Message too large for image: {len(binary_message)} bits > {max_capacity} capacity")
            
            print(f"\n=== Encoding Details ===")
            print(f"Image size: {pixels.shape[0]}x{pixels.shape[1]}")
            print(f"Maximum capacity: {max_capacity} bits")
            print(f"Binary message length: {len(binary_message)} bits")
            print(f"First 100 bits of message: {binary_message[:100]}")
            
            # Perform LSB encoding
            index = 0
            for i in range(pixels.shape[0]):
                for j in range(pixels.shape[1]):
                    for k in range(3):
                        if index < len(binary_message):
                            pixels[i, j, k] = (pixels[i, j, k] & 0xFE) | int(binary_message[index])
                            index += 1
            
            # Create encoded image
            encoded_img = Image.fromarray(pixels, mode="RGB")
            
            # 3. Add metadata using PNG info
            pnginfo = PngImagePlugin.PngInfo()
            
            # Add metadata as PNG text chunks
            pnginfo.add_text("salt", salt_hex)
            pnginfo.add_text("iv", iv_hex)
            pnginfo.add_text("authTag", auth_tag_hex)
            
            print(f"\n=== Saving Image ===")
            print(f"Adding metadata to PNG info:")
            print(f"  - Salt: {salt_hex}")
            print(f"  - IV: {iv_hex}")
            print(f"  - Auth Tag: {auth_tag_hex}")
            
            # 4. Save to TEMPORARY file first
            print(f"Saving to temporary file: {temp_path}")
            encoded_img.save(temp_path, "PNG", pnginfo=pnginfo, compress_level=0)
            
            # 5. Verify temporary file and metadata
            if not verify_image_save(temp_path):
                raise ValueError("Temporary file verification failed")
            
            # Verify metadata
            with Image.open(temp_path) as verified:
                print(f"\n=== Verifying Metadata ===")
                print("Checking metadata presence and lengths:")
                
                if not verified.text.get('salt'):
                    raise ValueError("Missing salt in metadata")
                if not verified.text.get('iv'):
                    raise ValueError("Missing IV in metadata")
                if not verified.text.get('authTag'):
                    raise ValueError("Missing auth tag in metadata")
                
                print(f"Extracted metadata:")
                print(f"  - Salt: {verified.text['salt']} (length: {len(verified.text['salt'])})")
                print(f"  - IV: {verified.text['iv']} (length: {len(verified.text['iv'])})")
                print(f"  - Auth Tag: {verified.text['authTag']} (length: {len(verified.text['authTag'])})")
                
                # Verify metadata lengths
                if len(verified.text['salt']) != 32:
                    raise ValueError(f"Invalid salt length in metadata: {len(verified.text['salt'])}")
                if len(verified.text['iv']) != 24:
                    raise ValueError(f"Invalid IV length in metadata: {len(verified.text['iv'])}")
                if len(verified.text['authTag']) != 32:
                    raise ValueError(f"Invalid auth tag length in metadata: {len(verified.text['authTag'])}")
                
                print("Metadata verification successful")
        
        # Atomic rename outside the context manager
        print(f"\n=== Finalizing ===")
        print(f"Moving temporary file to final location: {output_path}")
        os.replace(temp_path, output_path)
        
        # Final verification
        if not verify_image_save(output_path):
            raise ValueError("Final file verification failed")
        
        print("\n=== Encoding Complete ===")
        print("Image encoding completed successfully")
        return True
            
    except Exception as e:
        print(f"\n=== Error Occurred ===")
        print(f"ENCODE_ERROR: {str(e)}", file=sys.stderr)
        if os.path.exists(temp_path):
            print(f"Cleaning up temporary file: {temp_path}", file=sys.stderr)
            os.remove(temp_path)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Usage: steg.py <input> <encrypted_data> <output> <salt> <iv> <auth_tag>", file=sys.stderr)
        sys.exit(1)
        
    success = encode_image(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6])
    sys.exit(0 if success else 1)
