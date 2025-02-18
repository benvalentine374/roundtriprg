#!/bin/bash

usage() {
    echo "Usage: $0 [-n NUMBER | -all | -h]"
    echo "  -n NUMBER   Convert only dictionaryNUMBER.txt (e.g., -n 4 for dictionary4.txt)"
    echo "  -all        Convert all dictionary*.txt files"
    echo "  -h          Show this help message"
    exit 1
}

# the user must specify a single dictionary file or all files
if [[ "$1" == "-h" ]]; then
    usage
elif [[ "$1" == "-n" && "$2" =~ ^[0-9]+$ ]]; then
    files=("dictionary$2.txt")
elif [[ "$1" == "-all" ]]; then
    files=(dictionary*.txt)
else
    usage
fi

# given a list(s) of words per line, dictionary*.txt,
# make the words lowercase,
# sort them alphabetically and remove duplicates,
# convert to JSON format,
# and write to dictionary*.json.
for f in "${files[@]}"; do
    if [[ -f "$f" ]]; then
        cat "$f" | tr '[:upper:]' '[:lower:]' | sort -u | jq -R -s 'split("\n")[:-1]' > "${f%.txt}.json"
        echo "Processed: $f -> ${f%.txt}.json"
    else
        echo "File $f not found."
    fi
done
