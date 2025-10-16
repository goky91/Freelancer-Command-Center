#!/bin/bash

# =============================================================================
# FRONTEND DEPLOYMENT SCRIPT ZA S3 + CloudFront
# =============================================================================
#
# Ova skripta:
# 1. Build-uje React aplikaciju
# 2. Upload-uje fajlove na S3
# 3. Invalidate-uje CloudFront cache (da korisnici vide nove izmene)
#
# Preduslovi:
# - AWS CLI instaliran i konfigurisan (aws configure)
# - S3 bucket kreiran
# - CloudFront distribucija kreirana (opciono)
#
# Kako koristiti:
# chmod +x deploy-frontend.sh
# ./deploy-frontend.sh

set -e

echo "🚀 Starting frontend deployment..."

# =============================================================================
# KONFIGURACIJA
# =============================================================================

# PROMENI OVE VREDNOSTI!
S3_BUCKET="freelance-frontend-goran-bucket"  # Tvoj S3 bucket
CLOUDFRONT_DISTRIBUTION_ID=""              # Tvoj CloudFront ID (opciono)
AWS_REGION="eu-central-1"

# Boje za output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =============================================================================
# PROVERA AWS CLI
# =============================================================================
echo -e "${BLUE}🔍 Checking AWS CLI...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI not found!${NC}"
    echo "Install it: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# =============================================================================
# PROVERA NODE_MODULES
# =============================================================================
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# =============================================================================
# BUILD REACT APLIKACIJE
# =============================================================================
echo -e "${BLUE}🏗️  Building React application...${NC}"

# Šta se dešava u build procesu?
# 1. React kod (JSX) se kompajlira u obični JavaScript
# 2. TypeScript se kompajlira u JavaScript
# 3. CSS se optimizuje i minifikuje
# 4. Svi fajlovi se bundle-uju i optimizuju
# 5. Kreira se 'build' folder sa proizvodnim fajlovima

npm run build

echo -e "${GREEN}✅ Build completed${NC}"

# =============================================================================
# UPLOAD NA S3
# =============================================================================
echo -e "${BLUE}☁️  Uploading to S3...${NC}"

# aws s3 sync - sinhronizuje lokalni folder sa S3
# --delete   : Briše fajlove na S3 koji ne postoje lokalno (čisti stare fajlove)
# --acl      : Access Control List - 'public-read' znači da su fajlovi javno dostupni

aws s3 sync build/ s3://$S3_BUCKET/ \
    --region $AWS_REGION \
    --delete

# Postavljanje cache headers za razlicite tipove fajlova
echo -e "${BLUE}🔧 Setting cache headers...${NC}"

# HTML fajlovi - NE keširaj (uvek uzmi najnoviju verziju)
aws s3 cp build/index.html s3://$S3_BUCKET/index.html \
    --region $AWS_REGION \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

# JavaScript i CSS fajlovi - keširaj 1 godinu
# (React dodaje hash u ime fajla kad se promeni, tako da je sigurno keširat ih dugo)
aws s3 cp build/static/ s3://$S3_BUCKET/static/ \
    --region $AWS_REGION \
    --recursive \
    --cache-control "max-age=31536000, immutable" \
    --metadata-directive REPLACE

echo -e "${GREEN}✅ Files uploaded to S3${NC}"

# =============================================================================
# CLOUDFRONT CACHE INVALIDATION (opciono)
# =============================================================================

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"

    # Šta je Cache Invalidation?
    # CloudFront keširaj fajlove da bi ih brže služio.
    # Kad upload-uješ nove fajlove, moraš reći CloudFront-u da obriše stari cache.

    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"

    echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
else
    echo -e "${YELLOW}⚠️  CloudFront distribution ID not set, skipping cache invalidation${NC}"
fi

# =============================================================================
# GOTOVO!
# =============================================================================
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║       ✅ FRONTEND DEPLOYMENT SUCCESSFUL! 🎉          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "🌐 Your website is available at:"
echo "   S3: http://$S3_BUCKET.s3-website.$AWS_REGION.amazonaws.com"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "   CloudFront: (find your domain in CloudFront console)"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Test the website in your browser"
echo "   2. Update API endpoint in frontend config if needed"
echo "   3. Set up CloudFront if you haven't already (for HTTPS and better performance)"
