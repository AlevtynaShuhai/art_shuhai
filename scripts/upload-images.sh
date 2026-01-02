#!/bin/bash

# Load environment variables
source /Users/soul/Desktop/PROJECTS/drawing-master-v2/.env

STRAPI_URL="http://localhost:1337"
IMAGES_PATH="/Users/soul/Desktop/PROJECTS/drawing-master-v2/frontend/public"

echo "Starting image upload via curl..."
echo ""

# Function to upload file and get ID
upload_file() {
    local file_path="$1"
    local full_path="$IMAGES_PATH/$file_path"

    if [ ! -f "$full_path" ]; then
        echo "  File not found: $full_path"
        return 1
    fi

    local result=$(curl -s -X POST "$STRAPI_URL/api/upload" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        -F "files=@$full_path")

    local id=$(echo "$result" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "$id"
}

# Function to update entry
update_entry() {
    local endpoint="$1"
    local doc_id="$2"
    local field="$3"
    local image_id="$4"

    curl -s -X PUT "$STRAPI_URL/api$endpoint/$doc_id" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"$field\":$image_id}}" > /dev/null
}

echo "1. Uploading Settings images..."
logo_desktop_id=$(upload_file "assets/img/logo-art.svg")
echo "  logo-art.svg: ID=$logo_desktop_id"
logo_mobile_id=$(upload_file "assets/img/logo-art-mb.svg")
echo "  logo-art-mb.svg: ID=$logo_mobile_id"

if [ -n "$logo_desktop_id" ] || [ -n "$logo_mobile_id" ]; then
    curl -s -X PUT "$STRAPI_URL/api/setting" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"logoDesktop\":$logo_desktop_id,\"logoMobile\":$logo_mobile_id}}" > /dev/null
    echo "  Settings updated!"
fi
echo ""

echo "2. Uploading Homepage images..."
banner_desktop_id=$(upload_file "assets/img/bg-main-banner.webp")
echo "  bg-main-banner.webp: ID=$banner_desktop_id"
banner_mobile_id=$(upload_file "assets/img/bg-mobile-banner.webp")
echo "  bg-mobile-banner.webp: ID=$banner_mobile_id"
about_image_id=$(upload_file "assets/img/photo-about-the-author.png")
echo "  photo-about-the-author.png: ID=$about_image_id"

curl -s -X PUT "$STRAPI_URL/api/homepage" \
    -H "Authorization: Bearer $STRAPI_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"data\":{\"bannerImage\":$banner_desktop_id,\"bannerImageMobile\":$banner_mobile_id,\"aboutImage\":$about_image_id}}" > /dev/null
echo "  Homepage updated!"
echo ""

echo "3. Uploading Event images..."

# Get all events
events_json=$(curl -s "$STRAPI_URL/api/events?pagination[pageSize]=100" \
    -H "Authorization: Bearer $STRAPI_API_TOKEN")

# Event image mappings
declare -A event_images
event_images["Wine Painting Class"]="assets/img/WP.JPG"
event_images["Spirit Island in Watercolor"]="assets/img/SI.PNG"
event_images["Sunset Glow Acrylic Class"]="assets/img/SG.PNG"
event_images["Quiet Moment Acrylic Class"]="assets/img/QM.PNG"
event_images["Edge of Summer Acrylic Class"]="assets/img/DR.PNG"
event_images["Acrylic Peyto Lake Landscape"]="assets/img/PL.PNG"
event_images["Frost and Sun in Watercolor"]="assets/img/FS.PNG"
event_images["Your Pet Acrylic Portrait"]="assets/img/PP.JPG"
event_images["Citrus Therapy Acrylic Class"]="assets/img/mnd.PNG"
event_images["Into the Rockies Acrylic Class"]="assets/img/IMG_1695.PNG"
event_images["Winter on Fire Acrylic Class"]="assets/img/IMG_1677.PNG"
event_images["Beyond Today Acrylic Class"]="assets/img/IMG_1673.PNG"
event_images["Silent Light Acrylic Class"]="assets/img/IMG_1680.PNG"
event_images["February Watercolor Class"]="assets/img/IMG_1724.PNG"
event_images["Echoes of Flame Acrylic Class"]="assets/img/IMG_1692.PNG"
event_images["Awaiting Spring Acrylic Class"]="assets/img/IMG_1694.PNG"
event_images["Regular Art Classes for Adults"]="assets/img/photo.webp"
event_images["Private Art Classes"]="assets/img/adults.JPG"

for title in "${!event_images[@]}"; do
    image_path="${event_images[$title]}"

    # Get document ID for this event
    doc_id=$(echo "$events_json" | grep -o "\"documentId\":\"[^\"]*\",\"title\":\"$title\"" | head -1 | cut -d'"' -f4)

    if [ -n "$doc_id" ]; then
        echo "  $title..."
        image_id=$(upload_file "$image_path")
        if [ -n "$image_id" ]; then
            update_entry "/events" "$doc_id" "image" "$image_id"
            echo "    Uploaded (ID: $image_id)"
        fi
    fi
done
echo "  Events done!"
echo ""

echo "4. Uploading Artwork images..."

# Get all artworks
artworks_json=$(curl -s "$STRAPI_URL/api/artworks?pagination[pageSize]=100" \
    -H "Authorization: Bearer $STRAPI_API_TOKEN")

declare -A artwork_images
artwork_images["Student Artwork 1"]="assets/img/gallery/student_artwork/IMG_1819.webp"
artwork_images["Student Artwork 2"]="assets/img/gallery/student_artwork/IMG_1014.webp"
artwork_images["Student Artwork 3"]="assets/img/gallery/student_artwork/IMG_0552.webp"
artwork_images["Student Artwork 4"]="assets/img/gallery/student_artwork/IMG_3963.webp"
artwork_images["Instructor Artwork 1"]="assets/img/gallery/my_artwork/IMG_1469.webp"
artwork_images["Instructor Artwork 2"]="assets/img/gallery/my_artwork/IMG_7640.webp"
artwork_images["Instructor Artwork 3"]="assets/img/gallery/my_artwork/IMG_5363.webp"
artwork_images["Instructor Artwork 4"]="assets/img/gallery/my_artwork/IMG_3931.webp"

for title in "${!artwork_images[@]}"; do
    image_path="${artwork_images[$title]}"

    doc_id=$(echo "$artworks_json" | grep -o "\"documentId\":\"[^\"]*\",\"title\":\"$title\"" | head -1 | cut -d'"' -f4)

    if [ -n "$doc_id" ]; then
        echo "  $title..."
        image_id=$(upload_file "$image_path")
        if [ -n "$image_id" ]; then
            update_entry "/artworks" "$doc_id" "image" "$image_id"
            echo "    Uploaded (ID: $image_id)"
        fi
    fi
done
echo "  Artworks done!"
echo ""

echo "All images uploaded! Check http://localhost:1337/admin"
