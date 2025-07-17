from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

# Mock property data
MOCK_PROPERTIES = [
    {
        "id": 1,
        "address": "123 Main St, Anytown, USA",
        "price": 450000,
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 1800,
        "property_type": "Single Family",
        "status": "Active",
        "days_on_market": 15,
        "description": "Beautiful 3-bedroom home in quiet neighborhood",
        "features": ["Hardwood floors", "Updated kitchen", "Large backyard"],
        "images": ["/property-images/house1.jpg"]
    },
    {
        "id": 2,
        "address": "456 Oak Ave, Somewhere, USA",
        "price": 325000,
        "bedrooms": 2,
        "bathrooms": 1,
        "sqft": 1200,
        "property_type": "Condo",
        "status": "Active",
        "days_on_market": 8,
        "description": "Modern condo in downtown area",
        "features": ["City views", "Gym access", "Parking included"],
        "images": ["/property-images/condo1.jpg"]
    },
    {
        "id": 3,
        "address": "789 Pine Rd, Elsewhere, USA",
        "price": 750000,
        "bedrooms": 4,
        "bathrooms": 3,
        "sqft": 2400,
        "property_type": "Single Family",
        "status": "Active",
        "days_on_market": 3,
        "description": "Luxury home with premium finishes",
        "features": ["Granite counters", "Master suite", "3-car garage"],
        "images": ["/property-images/luxury1.jpg"]
    }
]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse URL and query parameters
            parsed_url = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            
            # Filter properties based on query parameters
            properties = MOCK_PROPERTIES.copy()
            
            if 'min_price' in query_params:
                min_price = int(query_params['min_price'][0])
                properties = [p for p in properties if p["price"] >= min_price]
            
            if 'max_price' in query_params:
                max_price = int(query_params['max_price'][0])
                properties = [p for p in properties if p["price"] <= max_price]
            
            if 'bedrooms' in query_params:
                bedrooms = int(query_params['bedrooms'][0])
                properties = [p for p in properties if p["bedrooms"] >= bedrooms]
            
            if 'property_type' in query_params:
                property_type = query_params['property_type'][0]
                properties = [p for p in properties if p["property_type"].lower() == property_type.lower()]
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(properties).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()