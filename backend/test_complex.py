#!/usr/bin/env python3
"""
Complex test for steganography with longer messages
"""

import os
import sys
import subprocess
from PIL import Image
import numpy as np

def create_test_image(output_path, size=(200, 200)):
    """Create a larger test image"""
    img = Image.new('RGB', size, color='lightblue')
    img.save(output_path)
    return output_path

def test_complex_steganography():
    """Test with a longer message"""
    
    # Test parameters
    test_image = "test_complex_input.png"
    encoded_image = "test_complex_encoded.png"
    test_message = "This is a much longer test message that contains multiple sentences and special characters: !@#$%^&*()_+-=[]{}|;':\",./<>?`~. It also includes numbers 1234567890 and unicode characters like éñüß. The message should be long enough to test the capacity limits of the steganography system."
    test_password = "complex_password_with_special_chars!@#$%"
    
    try:
        # Create test image
        print("Creating larger test image...")
        create_test_image(test_image)
        
        # Test encoding
        print("Testing encoding with long message...")
        encode_cmd = [
            sys.executable, "steg.py", 
            test_image, encoded_image, 
            test_message, test_password
        ]
        
        result = subprocess.run(encode_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Encoding failed: {result.stderr}")
            return False
        print("Encoding successful!")
        
        # Test decoding
        print("Testing decoding...")
        decode_cmd = [
            sys.executable, "decode_Steg0.py", 
            encoded_image, test_password
        ]
        
        result = subprocess.run(decode_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Decoding failed: {result.stderr}")
            return False
            
        decoded_message = result.stdout.strip()
        if "Recovered message:" in decoded_message:
            actual_message = decoded_message.split("Recovered message: ")[1]
            if actual_message == test_message:
                print("Decoding successful! Long message matches perfectly.")
                return True
            else:
                print(f"Message mismatch! Expected length: {len(test_message)}, Got length: {len(actual_message)}")
                print(f"First 50 chars expected: '{test_message[:50]}'")
                print(f"First 50 chars got: '{actual_message[:50]}'")
                return False
        else:
            print(f"Unexpected decode output: {decoded_message}")
            return False
            
    except Exception as e:
        print(f"Test failed with exception: {e}")
        return False
    finally:
        # Cleanup
        for file in [test_image, encoded_image]:
            if os.path.exists(file):
                os.remove(file)

if __name__ == "__main__":
    print("Testing complex steganography encoding and decoding...")
    success = test_complex_steganography()
    if success:
        print("✅ Complex test passed!")
        sys.exit(0)
    else:
        print("❌ Complex test failed!")
        sys.exit(1) 