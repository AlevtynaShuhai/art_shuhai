#!/bin/bash

source /Users/soul/Desktop/PROJECTS/drawing-master-v2/.env 2>/dev/null
export STRAPI_API_TOKEN="f9042e98629ffdac3d64aeec1d058359245c232eac8e87a6c4986f53600255340dcdc95b2f07f5b7aa0dc2802875e0f68c0d327575c4d0639d346b5919d7be5a9adfd4a16a6eef0b74d062cfe8f1f385f0cc93b9a8e759ee0d5fd3cdd3d0fb027a5c0c05980fa6ca5a41e3d902724f84e797ee533749b733de8bab32973f1119"

STRAPI_URL="http://localhost:1337"
IMAGES_PATH="/Users/soul/Desktop/PROJECTS/drawing-master-v2/frontend/public"

upload_and_link() {
    local title="$1"
    local image_path="$2"
    local endpoint="$3"

    echo "  $title..."

    # Upload image
    local upload_result=$(curl -s -X POST "$STRAPI_URL/api/upload" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        -F "files=@$IMAGES_PATH/$image_path")

    local image_id=$(echo "$upload_result" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)

    if [ -z "$image_id" ]; then
        echo "    Failed to upload"
        return
    fi

    # Get document ID
    local entries=$(curl -s "$STRAPI_URL/api$endpoint?pagination[pageSize]=100" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN")

    local doc_id=$(echo "$entries" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data.get('data', []):
    if item.get('title') == '$title':
        print(item.get('documentId', ''))
        break
" 2>/dev/null)

    if [ -n "$doc_id" ]; then
        curl -s -X PUT "$STRAPI_URL/api$endpoint/$doc_id" \
            -H "Authorization: Bearer $STRAPI_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"data\":{\"image\":$image_id}}" > /dev/null
        echo "    Done (ID: $image_id)"
    else
        echo "    Entry not found"
    fi
}

echo "Uploading Event images..."
upload_and_link "Wine Painting Class" "assets/img/WP.JPG" "/events"
upload_and_link "Spirit Island in Watercolor" "assets/img/SI.PNG" "/events"
upload_and_link "Sunset Glow Acrylic Class" "assets/img/SG.PNG" "/events"
upload_and_link "Quiet Moment Acrylic Class" "assets/img/QM.PNG" "/events"
upload_and_link "Edge of Summer Acrylic Class" "assets/img/DR.PNG" "/events"
upload_and_link "Acrylic Peyto Lake Landscape" "assets/img/PL.PNG" "/events"
upload_and_link "Frost and Sun in Watercolor" "assets/img/FS.PNG" "/events"
upload_and_link "Your Pet Acrylic Portrait" "assets/img/PP.JPG" "/events"
upload_and_link "Citrus Therapy Acrylic Class" "assets/img/mnd.PNG" "/events"
upload_and_link "Into the Rockies Acrylic Class" "assets/img/IMG_1695.PNG" "/events"
upload_and_link "Winter on Fire Acrylic Class" "assets/img/IMG_1677.PNG" "/events"
upload_and_link "Beyond Today Acrylic Class" "assets/img/IMG_1673.PNG" "/events"
upload_and_link "Silent Light Acrylic Class" "assets/img/IMG_1680.PNG" "/events"
upload_and_link "February Watercolor Class" "assets/img/IMG_1724.PNG" "/events"
upload_and_link "Echoes of Flame Acrylic Class" "assets/img/IMG_1692.PNG" "/events"
upload_and_link "Awaiting Spring Acrylic Class" "assets/img/IMG_1694.PNG" "/events"
upload_and_link "Regular Art Classes for Adults" "assets/img/photo.webp" "/events"
upload_and_link "Private Art Classes" "assets/img/adults.JPG" "/events"

echo ""
echo "Uploading Artwork images..."
upload_and_link "Student Artwork 1" "assets/img/gallery/student_artwork/IMG_1819.webp" "/artworks"
upload_and_link "Student Artwork 2" "assets/img/gallery/student_artwork/IMG_1014.webp" "/artworks"
upload_and_link "Student Artwork 3" "assets/img/gallery/student_artwork/IMG_0552.webp" "/artworks"
upload_and_link "Student Artwork 4" "assets/img/gallery/student_artwork/IMG_3963.webp" "/artworks"
upload_and_link "Instructor Artwork 1" "assets/img/gallery/my_artwork/IMG_1469.webp" "/artworks"
upload_and_link "Instructor Artwork 2" "assets/img/gallery/my_artwork/IMG_7640.webp" "/artworks"
upload_and_link "Instructor Artwork 3" "assets/img/gallery/my_artwork/IMG_5363.webp" "/artworks"
upload_and_link "Instructor Artwork 4" "assets/img/gallery/my_artwork/IMG_3931.webp" "/artworks"

echo ""
echo "Done!"
