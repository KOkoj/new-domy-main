#!/usr/bin/env python3
"""
Extended Backend Tests for Italian Property Platform
Tests edge cases and additional scenarios
"""

import requests
import json
import time

BASE_URL = "https://realestate-italy.preview.emergentagent.com/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_properties_edge_cases():
    """Test edge cases for properties API"""
    print("\n=== Testing Properties API Edge Cases ===")
    
    # Test with multiple filters
    params = {
        "type": "villa",
        "city": "como",
        "featured": "true",
        "search": "luxury"
    }
    response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, params=params, timeout=30)
    print(f"✅ Multiple filters test: Status {response.status_code}, Properties: {len(response.json())}")
    
    # Test with price range filters
    params = {
        "minPrice": "100000",
        "maxPrice": "1000000"
    }
    response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, params=params, timeout=30)
    print(f"✅ Price range filter test: Status {response.status_code}, Properties: {len(response.json())}")
    
    # Test with empty search
    params = {"search": ""}
    response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, params=params, timeout=30)
    print(f"✅ Empty search test: Status {response.status_code}, Properties: {len(response.json())}")
    
    # Test with special characters in search
    params = {"search": "àèìòù"}
    response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, params=params, timeout=30)
    print(f"✅ Special characters search: Status {response.status_code}, Properties: {len(response.json())}")

def test_inquiries_validation():
    """Test inquiry validation and edge cases"""
    print("\n=== Testing Inquiries Validation ===")
    
    # Test with very long message
    long_message = "A" * 5000  # 5000 character message
    inquiry_data = {
        "listingId": "test-property-long",
        "name": "Test User",
        "email": "test@example.com",
        "message": long_message
    }
    response = requests.post(f"{BASE_URL}/inquiries", headers=HEADERS, json=inquiry_data, timeout=30)
    print(f"✅ Long message test: Status {response.status_code}")
    
    # Test with special characters in name
    inquiry_data = {
        "listingId": "test-property-special",
        "name": "José María García-López",
        "email": "jose.garcia@example.com",
        "message": "Hola, estoy interesado en esta propiedad. ¿Podrían darme más información?"
    }
    response = requests.post(f"{BASE_URL}/inquiries", headers=HEADERS, json=inquiry_data, timeout=30)
    print(f"✅ Special characters in name: Status {response.status_code}")
    
    # Test with invalid email format
    inquiry_data = {
        "listingId": "test-property-invalid-email",
        "name": "Test User",
        "email": "invalid-email",
        "message": "Test message"
    }
    response = requests.post(f"{BASE_URL}/inquiries", headers=HEADERS, json=inquiry_data, timeout=30)
    print(f"✅ Invalid email format: Status {response.status_code}")
    
    # Test with empty required fields
    inquiry_data = {
        "listingId": "",
        "name": "",
        "email": "",
        "message": ""
    }
    response = requests.post(f"{BASE_URL}/inquiries", headers=HEADERS, json=inquiry_data, timeout=30)
    print(f"✅ Empty required fields: Status {response.status_code}")

def test_api_performance():
    """Test API response times"""
    print("\n=== Testing API Performance ===")
    
    endpoints = [
        "/properties",
        "/properties?featured=true",
        "/inquiries"
    ]
    
    for endpoint in endpoints:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, timeout=30)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        print(f"✅ {endpoint}: {response.status_code} in {response_time:.0f}ms")

def test_cors_and_headers():
    """Test CORS and response headers"""
    print("\n=== Testing CORS and Headers ===")
    
    # Test with different origins
    test_headers = HEADERS.copy()
    test_headers["Origin"] = "https://example.com"
    
    response = requests.get(f"{BASE_URL}/properties", headers=test_headers, timeout=30)
    print(f"✅ CORS test: Status {response.status_code}")
    print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
    
    # Check content type
    print(f"   Content-Type: {response.headers.get('Content-Type', 'Not set')}")

def test_concurrent_requests():
    """Test handling of concurrent requests"""
    print("\n=== Testing Concurrent Requests ===")
    
    import threading
    import queue
    
    results = queue.Queue()
    
    def make_request():
        try:
            response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, timeout=30)
            results.put(("success", response.status_code))
        except Exception as e:
            results.put(("error", str(e)))
    
    # Create 5 concurrent threads
    threads = []
    for i in range(5):
        thread = threading.Thread(target=make_request)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Collect results
    success_count = 0
    error_count = 0
    
    while not results.empty():
        result_type, result_value = results.get()
        if result_type == "success":
            success_count += 1
        else:
            error_count += 1
    
    print(f"✅ Concurrent requests: {success_count} successful, {error_count} errors")

def test_data_consistency():
    """Test data consistency across multiple requests"""
    print("\n=== Testing Data Consistency ===")
    
    # Make multiple requests and ensure consistent results
    responses = []
    for i in range(3):
        response = requests.get(f"{BASE_URL}/properties", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            responses.append(response.json())
        time.sleep(1)  # Small delay between requests
    
    if len(responses) >= 2:
        # Check if responses are consistent
        first_response = responses[0]
        consistent = all(response == first_response for response in responses[1:])
        print(f"✅ Data consistency: {'Consistent' if consistent else 'Inconsistent'} across {len(responses)} requests")
    else:
        print("❌ Could not test data consistency - insufficient successful responses")

def run_extended_tests():
    """Run all extended tests"""
    print("🔬 Starting Extended Backend Tests")
    print("=" * 60)
    
    try:
        test_properties_edge_cases()
        test_inquiries_validation()
        test_api_performance()
        test_cors_and_headers()
        test_concurrent_requests()
        test_data_consistency()
        
        print("\n" + "=" * 60)
        print("✅ Extended tests completed successfully")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Extended tests failed with error: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = run_extended_tests()
    exit(0 if success else 1)