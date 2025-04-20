from PIL import Image
import sys
import json

def read_metadata(image_path):
    try:
        img = Image.open(image_path)
        metadata = img.info
        print(json.dumps(metadata))
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: read_metadata.py <image_path>", file=sys.stderr)
        sys.exit(1)
    read_metadata(sys.argv[1]) 