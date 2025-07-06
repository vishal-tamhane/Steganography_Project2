#!/usr/bin/env python3
"""
Test script for steganography encoding and decoding
"""

import os
import sys
import subprocess
from PIL import Image
import numpy as np

def create_test_image(output_path, size=(100, 100)):
    """Create a simple test image"""
    img = Image.new('RGB', size, color='white')
    img.save(output_path)
    return output_path

def test_steganography():
    """Test the complete steganography workflow"""
    
    # Test parameters
    test_image = "test_input.png"
    encoded_image = "test_encoded.png"
    test_message = "Hello, this is a test message!"
    test_password = "test_password123"
    
    try:
        # Create test image
        print("Creating test image...")
        create_test_image(test_image)
        
        # Test encoding
        print("Testing encoding...")
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
                print("Decoding successful! Message matches.")
                return True
            else:
                print(f"Message mismatch! Expected: '{test_message}', Got: '{actual_message}'")
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
    print("Testing steganography encoding and decoding...")
    success = test_steganography()
    if success:
        print("✅ All tests passed!")
        sys.exit(0)
    else:
        print("❌ Tests failed!")
        sys.exit(1) 