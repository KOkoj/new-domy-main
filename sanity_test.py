#!/usr/bin/env python3
"""
Test Sanity CMS integration to check if properties are available
"""

import requests
import json

# Sanity API configuration from .env
SANITY_PROJECT_ID = "o6yxt3nc"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

def test_sanity_connection():
    """Test connection to Sanity CMS"""
    print("🔍 Testing Sanity CMS Integration")
    print("=" * 50)
    
    # Test basic connection
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"
    
    # Simple query to get all listings
    query = "*[_type == 'listing']"
    params = {"query": query}
    
    try:
        response = requests.get(url, params=params, timeout=30)
        print(f"✅ Sanity API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            listings = data.get("result", [])
            print(f"✅ Total listings in Sanity: {len(listings)}")
            
            if listings:
                print("\n📋 Sample listing structure:")
                sample = listings[0]
                for key in sample.keys():
                    print(f"  • {key}: {type(sample[key]).__name__}")
            else:
                print("⚠️  No listings found in Sanity CMS")
                print("   This explains why /api/properties returns empty arrays")
        else:
            print(f"❌ Sanity API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection to Sanity failed: {str(e)}")
    
    # Test featured listings query
    print("\n" + "-" * 30)
    featured_query = "*[_type == 'listing' && featured == true]"
    params = {"query": featured_query}
    
    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            featured_listings = data.get("result", [])
            print(f"✅ Featured listings in Sanity: {len(featured_listings)}")
        else:
            print(f"❌ Featured query failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Featured query error: {str(e)}")
    
    # Test cities query
    print("\n" + "-" * 30)
    cities_query = "*[_type == 'city']"
    params = {"query": cities_query}
    
    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            cities = data.get("result", [])
            print(f"✅ Cities in Sanity: {len(cities)}")
            if cities:
                city_names = [city.get("name", {}).get("en", "Unknown") for city in cities[:5]]
                print(f"   Sample cities: {', '.join(city_names)}")
        else:
            print(f"❌ Cities query failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cities query error: {str(e)}")

if __name__ == "__main__":
    test_sanity_connection()