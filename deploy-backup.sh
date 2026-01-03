#!/bin/bash

# Strapi Full Backup & Deploy Script
# Usage: ./deploy-backup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CMS_DIR="$SCRIPT_DIR/cms"
BACKUP_FILE="$SCRIPT_DIR/backup.tar.gz"
SERVER_IP="184.170.142.45"
SSH_KEY="$HOME/.ssh/ishosting"
STRAPI_CONTAINER="eosw0c0scssw084o4co40o4g-030514160040"

SSH_CMD="ssh -i $SSH_KEY"
SCP_CMD="scp -i $SSH_KEY"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Strapi Full Backup & Deploy ===${NC}"
echo ""

# Step 1: Create local backup
echo -e "${GREEN}1. Creating local backup...${NC}"
cd "$CMS_DIR"

# Remove old backup if exists
rm -f "$BACKUP_FILE"

# Export from Strapi
npx strapi export --no-encrypt -f "$SCRIPT_DIR/backup"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file was not created${NC}"
    exit 1
fi

echo -e "   Backup created: $(du -h "$BACKUP_FILE" | cut -f1)"

# Step 2: Upload to server
echo -e "${GREEN}2. Uploading backup to server...${NC}"
$SCP_CMD "$BACKUP_FILE" root@${SERVER_IP}:/tmp/backup-upload.tar.gz

# Step 3: Extract and prepare on server
echo -e "${GREEN}3. Extracting and preparing files on server...${NC}"
$SSH_CMD root@${SERVER_IP} << ENDSSH
set -e
cd /tmp
rm -rf backup-work && mkdir backup-work && cd backup-work
tar -xzf /tmp/backup-upload.tar.gz

echo "   Copying files to container..."
docker exec $STRAPI_CONTAINER rm -rf /tmp/import-data
docker exec $STRAPI_CONTAINER mkdir -p /tmp/import-data

for f in metadata.json schemas entities links configuration assets; do
  if [ -e "\$f" ]; then
    docker cp "\$f" $STRAPI_CONTAINER:/tmp/import-data/
    echo "   - \$f"
  fi
done

echo "   Setting permissions..."
docker exec -u 0 $STRAPI_CONTAINER chmod -R 755 /tmp/import-data
docker exec -u 0 $STRAPI_CONTAINER chown -R 1001:1001 /tmp/import-data

echo "   Creating Node.js tar archive..."
docker exec $STRAPI_CONTAINER node -e "
const tar = require('tar');
const fs = require('fs');
process.chdir('/tmp/import-data');
const files = fs.readdirSync('.').filter(f => !f.startsWith('.'));
tar.create({ file: '/tmp/import.tar', sync: true }, files);
"

rm -rf /tmp/backup-work /tmp/backup-upload.tar.gz
ENDSSH

# Step 4: Run import
echo -e "${GREEN}4. Running Strapi import...${NC}"
$SSH_CMD -t root@${SERVER_IP} "docker exec -it $STRAPI_CONTAINER npx strapi import -f /tmp/import.tar --force"

# Step 5: Cleanup local backup (optional - comment out to keep)
# rm -f "$BACKUP_FILE"

echo ""
echo -e "${GREEN}=== Deploy completed successfully! ===${NC}"
echo -e "Server: ${YELLOW}https://cms.art-shuhai.com${NC} (or your domain)"
