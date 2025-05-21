#!/bin/bash

API_URL="http://localhost:4000/api/products/"
OWNER_ID="681c6445005de231e3092a97" # Change to a valid user ID

products='[
  {
    "title": "Road Bicycle",
    "description": "Lightweight and fast, ideal for city commuting.",
    "price": 100,
    "category": "Sports",
    "location": "Tunis",
    "geoLocation": { "type": "Point", "coordinates": [10.1658, 36.8065] },
    "image": "https://source.unsplash.com/300x200/?bike",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Canon EOS R Camera",
    "description": "Professional mirrorless camera for content creators.",
    "price": 300,
    "category": "Photography",
    "location": "Sfax",
    "geoLocation": { "type": "Point", "coordinates": [10.7603, 34.7406] },
    "image": "https://source.unsplash.com/300x200/?camera",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Camping Tent 4P",
    "description": "Spacious and waterproof, perfect for weekend getaways.",
    "price": 60,
    "category": "Outdoors",
    "location": "Bizerte",
    "geoLocation": { "type": "Point", "coordinates": [9.8739, 37.2744] },
    "image": "https://source.unsplash.com/300x200/?tent",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "DJI Mini Drone",
    "description": "Capture stunning aerial footage in 4K.",
    "price": 180,
    "category": "Electronics",
    "location": "Sousse",
    "geoLocation": { "type": "Point", "coordinates": [10.6406, 35.8256] },
    "image": "https://source.unsplash.com/300x200/?drone",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Electric Guitar",
    "description": "6-string beginner guitar with amp included.",
    "price": 90,
    "category": "Music",
    "location": "Gabes",
    "geoLocation": { "type": "Point", "coordinates": [10.1010, 33.8815] },
    "image": "https://source.unsplash.com/300x200/?guitar",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "MacBook Pro 2020",
    "description": "M1 chip, fast and reliable for design or dev work.",
    "price": 500,
    "category": "Computers",
    "location": "Nabeul",
    "geoLocation": { "type": "Point", "coordinates": [10.7357, 36.4514] },
    "image": "https://source.unsplash.com/300x200/?macbook",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "GoPro Hero 10",
    "description": "Perfect for action sports and vlogging.",
    "price": 150,
    "category": "Photography",
    "location": "Mahdia",
    "geoLocation": { "type": "Point", "coordinates": [11.0409, 35.5047] },
    "image": "https://source.unsplash.com/300x200/?gopro",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Xbox Series S",
    "description": "Next-gen console with hundreds of games.",
    "price": 250,
    "category": "Gaming",
    "location": "Kairouan",
    "geoLocation": { "type": "Point", "coordinates": [10.1000, 35.6781] },
    "image": "https://source.unsplash.com/300x200/?xbox",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Portable Projector",
    "description": "Stream movies anywhere with this compact projector.",
    "price": 70,
    "category": "Electronics",
    "location": "Zarzis",
    "geoLocation": { "type": "Point", "coordinates": [11.1122, 33.5038] },
    "image": "https://source.unsplash.com/300x200/?projector",
    "owner": "'$OWNER_ID'"
  },
  {
    "title": "Yoga Mat",
    "description": "Non-slip surface, ideal for home workouts.",
    "price": 20,
    "category": "Fitness",
    "location": "Manouba",
    "geoLocation": { "type": "Point", "coordinates": [10.0972, 36.8104] },
    "image": "https://source.unsplash.com/300x200/?yoga",
    "owner": "'$OWNER_ID'"
  }
]'

# Inject each product using curl
echo "$products" | jq -c '.[]' | while read -r product; do
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$product"
  echo -e "\nInjected: $(echo "$product" | jq -r .title)"
done

