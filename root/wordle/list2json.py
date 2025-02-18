import json
import sys

def usage():
    print("Usage: python list2json.py <input_file>")
    print("Converts a newline-delimited file into JSON.")
    print("Example: python list2json.py example.txt > example.json")
    print("\nOptions:")
    print("  -h, --help   Show this help message and exit")

def parse_json(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            items = f.read().splitlines()
        print(json.dumps(items, indent=2))
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] in ("-h", "--help"):
        usage()
        sys.exit(0)
    parse_json(sys.argv[1])
