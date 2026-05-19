#!/usr/bin/env bash
# optimize-images.sh
# Kör detta en gång för att konvertera bilder till WebP
# Kräver: cwebp (sudo apt install webp / brew install webp)
#         eller ImageMagick (sudo apt install imagemagick)

set -e

INPUT_DIR="./src/assets"
PUBLIC_DIR="./public"

echo "Kontrollerar verktyg..."

if command -v cwebp &> /dev/null; then
  TOOL="cwebp"
elif command -v convert &> /dev/null; then
  TOOL="imagemagick"
else
  echo "Installera cwebp: sudo apt install webp"
  echo "Eller ImageMagick: sudo apt install imagemagick"
  exit 1
fi

convert_to_webp() {
  local input="$1"
  local output="${input%.*}.webp"

  if [ "$TOOL" = "cwebp" ]; then
    cwebp -q 82 "$input" -o "$output"
  else
    convert "$input" -quality 82 "$output"
  fi

  local before=$(wc -c < "$input")
  local after=$(wc -c < "$output")
  local saving=$(( (before - after) * 100 / before ))
  echo "✓ $(basename $input) → $(basename $output) (${saving}% smaller)"
}

echo "Konverterar bilder i $INPUT_DIR..."
for f in "$INPUT_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [ -f "$f" ] && convert_to_webp "$f"
done

echo ""
echo "Konverterar bilder i $PUBLIC_DIR..."
for f in "$PUBLIC_DIR"/*.{jpg,jpeg,JPG,JPEG}; do
  [ -f "$f" ] && convert_to_webp "$f"
done

echo ""
echo "Klar! Uppdatera importerna i koden:"
echo "  hero.png → hero.webp"
echo "  og-image.jpg → behåll .jpg (sociala medier kräver jpg/png)"