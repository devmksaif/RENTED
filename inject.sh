#!/bin/bash

# API URLs
USER_API_URL="http://localhost:4000/api/users"
PRODUCT_API_URL="http://localhost:4000/api/products/"

# Create admin user first
echo "Creating admin user..."
admin_response=$(curl -X POST "$USER_API_URL/create-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@rented.com",
    "password": "admin123",
    "adminKey": "RENTED_ADMIN_KEY"
  }')

ADMIN_ID=$(echo $admin_response | jq -r '._id')
echo "Admin user created with ID: $ADMIN_ID"

# Create regular user
echo "Creating regular user..."
user_response=$(curl -X POST "$USER_API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "user@rented.com",
    "password": "user123",
    "phone": "+1234567890",
    "address": "123 Test St",
    "accountType": "both",
    "verificationStatus": "verified"
  }')

USER_ID=$(echo $user_response | jq -r '._id')
echo "Regular user created with ID: $USER_ID"

# Products data
products='[
  {
    "title": "Road Bicycle",
    "description": "Lightweight and fast, ideal for city commuting.",
    "price": 100,
    "category": "Sports",
    "location": "Tunis",
    "geoLocation": { "type": "Point", "coordinates": [10.1658, 36.8065] },
    "image": "https://source.unsplash.com/300x200/?bike",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Canon EOS R Camera",
    "description": "Professional mirrorless camera for content creators.",
    "price": 300,
    "category": "Photography",
    "location": "Sfax",
    "geoLocation": { "type": "Point", "coordinates": [10.7603, 34.7406] },
    "image": "https://source.unsplash.com/300x200/?camera",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Camping Tent 4P",
    "description": "Spacious and waterproof, perfect for weekend getaways.",
    "price": 60,
    "category": "Outdoors",
    "location": "Bizerte",
    "geoLocation": { "type": "Point", "coordinates": [9.8739, 37.2744] },
    "image": "https://source.unsplash.com/300x200/?tent",
    "owner": "'$USER_ID'"
  },
  {
    "title": "DJI Mini Drone",
    "description": "Capture stunning aerial footage in 4K.",
    "price": 180,
    "category": "Electronics",
    "location": "Sousse",
    "geoLocation": { "type": "Point", "coordinates": [10.6406, 35.8256] },
    "image": "https://source.unsplash.com/300x200/?drone",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Electric Guitar",
    "description": "6-string beginner guitar with amp included.",
    "price": 90,
    "category": "Music",
    "location": "Gabes",
    "geoLocation": { "type": "Point", "coordinates": [10.1010, 33.8815] },
    "image": "https://source.unsplash.com/300x200/?guitar",
    "owner": "'$USER_ID'"
  },
  {
    "title": "MacBook Pro 2020",
    "description": "M1 chip, fast and reliable for design or dev work.",
    "price": 500,
    "category": "Computers",
    "location": "Nabeul",
    "geoLocation": { "type": "Point", "coordinates": [10.7357, 36.4514] },
    "image": "https://source.unsplash.com/300x200/?macbook",
    "owner": "'$USER_ID'"
  },
  {
    "title": "GoPro Hero 10",
    "description": "Perfect for action sports and vlogging.",
    "price": 150,
    "category": "Photography",
    "location": "Mahdia",
    "geoLocation": { "type": "Point", "coordinates": [11.0409, 35.5047] },
    "image": "https://source.unsplash.com/300x200/?gopro",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Xbox Series S",
    "description": "Next-gen console with hundreds of games.",
    "price": 250,
    "category": "Gaming",
    "location": "Kairouan",
    "geoLocation": { "type": "Point", "coordinates": [10.1000, 35.6781] },
    "image": "https://source.unsplash.com/300x200/?xbox",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Portable Projector",
    "description": "Stream movies anywhere with this compact projector.",
    "price": 70,
    "category": "Electronics",
    "location": "Zarzis",
    "geoLocation": { "type": "Point", "coordinates": [11.1122, 33.5038] },
    "image": "https://source.unsplash.com/300x200/?projector",
    "owner": "'$USER_ID'"
  },
  {
    "title": "Yoga Mat",
    "description": "Non-slip surface, ideal for home workouts.",
    "price": 20,
    "category": "Fitness",
    "location": "Manouba",
    "geoLocation": { "type": "Point", "coordinates": [10.0972, 36.8104] },
    "image": "https://source.unsplash.com/300x200/?yoga",
    "owner": "'$USER_ID'"
  }
]'

# Inject each product using curl
echo "Injecting products..."
echo "$products" | jq -c '.[]' | while read -r product; do
  curl -X POST "$PRODUCT_API_URL" \
    -H "Content-Type: application/json" \
    -d "$product"
  echo -e "\nInjected: $(echo "$product" | jq -r .title)"
done

echo "Data injection completed!"

