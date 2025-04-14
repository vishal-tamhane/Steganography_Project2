from PIL import Image
import numpy as np
import sys

def text_to_binary(text):
    return ''.join(format(ord(char), '08b') for char in text)

def encode_image(image_path, secret_message, output_path):
    img = Image.open(image_path)
    img = img.convert("RGB")  # Ensure it's in RGB mode
    pixels = np.array(img)
    
    binary_message = text_to_binary(secret_message) + '1111111111111110'  # End marker
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
    if len(sys.argv) != 4:
        print("Usage: python steg.py <input_image> <message> <output_image>")
        sys.exit(1)
    
    input_image = sys.argv[1]
    message = sys.argv[2]
    output_image = sys.argv[3]
    
    try:
        encode_image(input_image, message, output_image)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
