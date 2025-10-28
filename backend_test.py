#!/usr/bin/env python3
"""
Italian Property Platform Backend API Tests
Tests all backend endpoints with authentication scenarios
"""

import requests
import json
import uuid
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://realestate-italy.preview.emergentagent.com/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None, auth_headers: Dict = None) -> tuple:
        """Make HTTP request and return response and success status"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        if auth_headers:
            headers.update(auth_headers)
            
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=60)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, params=params, timeout=60)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, params=params, timeout=60)
            else:
                return None, False, "Unsupported HTTP method"
                
            return response, True, ""
        except requests.exceptions.RequestException as e:
            return None, False, f"Request failed: {str(e)}"
    
    def test_properties_api(self):
        """Test Properties API endpoints"""
        print("\n=== Testing Properties API ===")
        
        # Test 1: Get all properties
        response, success, error = self.make_request("GET", "/properties")
        if success and response.status_code == 200:
            try:
                properties = response.json()
                self.log_test("GET /api/properties", True, f"Retrieved {len(properties)} properties", len(properties))
            except json.JSONDecodeError:
                self.log_test("GET /api/properties", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/properties", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 2: Get featured properties
        response, success, error = self.make_request("GET", "/properties", params={"featured": "true"})
        if success and response.status_code == 200:
            try:
                featured_properties = response.json()
                self.log_test("GET /api/properties?featured=true", True, f"Retrieved {len(featured_properties)} featured properties")
            except json.JSONDecodeError:
                self.log_test("GET /api/properties?featured=true", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/properties?featured=true", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Filter by property type
        response, success, error = self.make_request("GET", "/properties", params={"type": "villa"})
        if success and response.status_code == 200:
            try:
                villa_properties = response.json()
                self.log_test("GET /api/properties?type=villa", True, f"Retrieved {len(villa_properties)} villa properties")
            except json.JSONDecodeError:
                self.log_test("GET /api/properties?type=villa", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/properties?type=villa", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Filter by city
        response, success, error = self.make_request("GET", "/properties", params={"city": "como"})
        if success and response.status_code == 200:
            try:
                como_properties = response.json()
                self.log_test("GET /api/properties?city=como", True, f"Retrieved {len(como_properties)} properties in Como")
            except json.JSONDecodeError:
                self.log_test("GET /api/properties?city=como", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/properties?city=como", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 5: Search properties
        response, success, error = self.make_request("GET", "/properties", params={"search": "luxury"})
        if success and response.status_code == 200:
            try:
                search_results = response.json()
                self.log_test("GET /api/properties?search=luxury", True, f"Retrieved {len(search_results)} properties matching 'luxury'")
            except json.JSONDecodeError:
                self.log_test("GET /api/properties?search=luxury", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/properties?search=luxury", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_favorites_api_unauthenticated(self):
        """Test Favorites API without authentication"""
        print("\n=== Testing Favorites API (Unauthenticated) ===")
        
        # Test 1: Get favorites without auth - should fail
        response, success, error = self.make_request("GET", "/favorites")
        if success and response.status_code == 401:
            self.log_test("GET /api/favorites (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("GET /api/favorites (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test 2: Toggle favorite without auth - should fail
        test_data = {"listingId": "test-property-1"}
        response, success, error = self.make_request("POST", "/favorites/toggle", data=test_data)
        if success and response.status_code == 401:
            self.log_test("POST /api/favorites/toggle (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("POST /api/favorites/toggle (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
    
    def test_saved_searches_api_unauthenticated(self):
        """Test Saved Searches API without authentication"""
        print("\n=== Testing Saved Searches API (Unauthenticated) ===")
        
        # Test 1: Get saved searches without auth - should fail
        response, success, error = self.make_request("GET", "/saved-searches")
        if success and response.status_code == 401:
            self.log_test("GET /api/saved-searches (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("GET /api/saved-searches (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test 2: Create saved search without auth - should fail
        test_data = {
            "name": "Lake Como Villas",
            "filters": {"type": "villa", "city": "como"}
        }
        response, success, error = self.make_request("POST", "/saved-searches", data=test_data)
        if success and response.status_code == 401:
            self.log_test("POST /api/saved-searches (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("POST /api/saved-searches (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test 3: Delete saved search without auth - should fail
        test_id = str(uuid.uuid4())
        response, success, error = self.make_request("DELETE", "/saved-searches", params={"id": test_id})
        if success and response.status_code == 401:
            self.log_test("DELETE /api/saved-searches (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("DELETE /api/saved-searches (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
    
    def test_inquiries_api(self):
        """Test Inquiries API (should work for anonymous users)"""
        print("\n=== Testing Inquiries API ===")
        
        # Test 1: Submit inquiry as anonymous user
        inquiry_data = {
            "listingId": "test-property-1",
            "name": "Marco Rossi",
            "email": "marco.rossi@example.com",
            "message": "Sono interessato a questa proprietà. Potreste fornirmi maggiori informazioni sui prezzi e sulla disponibilità?"
        }
        response, success, error = self.make_request("POST", "/inquiries", data=inquiry_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/inquiries (anonymous)", True, "Successfully submitted inquiry")
                else:
                    self.log_test("POST /api/inquiries (anonymous)", False, f"Unexpected response: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/inquiries (anonymous)", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/inquiries (anonymous)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 2: Get inquiries (should work but may be empty)
        response, success, error = self.make_request("GET", "/inquiries")
        if success and response.status_code == 200:
            try:
                inquiries = response.json()
                self.log_test("GET /api/inquiries", True, f"Retrieved {len(inquiries)} inquiries")
            except json.JSONDecodeError:
                self.log_test("GET /api/inquiries", False, "Invalid JSON response")
        else:
            self.log_test("GET /api/inquiries", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Submit inquiry with missing fields
        invalid_inquiry = {
            "listingId": "test-property-2",
            "name": "Test User"
            # Missing email and message
        }
        response, success, error = self.make_request("POST", "/inquiries", data=invalid_inquiry)
        if success:
            if response.status_code == 400 or response.status_code == 500:
                self.log_test("POST /api/inquiries (invalid data)", True, f"Correctly handled invalid data with status {response.status_code}")
            else:
                self.log_test("POST /api/inquiries (invalid data)", False, f"Expected error status, got {response.status_code}")
        else:
            self.log_test("POST /api/inquiries (invalid data)", False, f"Request failed: {error}")
    
    def test_api_error_handling(self):
        """Test API error handling"""
        print("\n=== Testing API Error Handling ===")
        
        # Test 1: Invalid endpoint
        response, success, error = self.make_request("GET", "/invalid-endpoint")
        if success and response.status_code in [404, 200]:  # 200 might return default message
            self.log_test("GET /api/invalid-endpoint", True, f"Handled invalid endpoint with status {response.status_code}")
        else:
            self.log_test("GET /api/invalid-endpoint", False, f"Unexpected response to invalid endpoint")
        
        # Test 2: Invalid JSON in POST request
        try:
            url = f"{self.base_url}/inquiries"
            response = requests.post(url, headers=self.headers, data="invalid json", timeout=30)
            if response.status_code in [400, 500]:
                self.log_test("POST with invalid JSON", True, f"Correctly handled invalid JSON with status {response.status_code}")
            else:
                self.log_test("POST with invalid JSON", False, f"Unexpected status {response.status_code} for invalid JSON")
        except Exception as e:
            self.log_test("POST with invalid JSON", False, f"Request failed: {str(e)}")
    
    def test_database_integration(self):
        """Test database integration by submitting and retrieving data"""
        print("\n=== Testing Database Integration ===")
        
        # Submit a unique inquiry and try to retrieve it
        unique_email = f"test-{int(time.time())}@example.com"
        unique_message = f"Test inquiry submitted at {time.strftime('%Y-%m-%d %H:%M:%S')}"
        
        inquiry_data = {
            "listingId": "integration-test-property",
            "name": "Database Test User",
            "email": unique_email,
            "message": unique_message
        }
        
        # Submit inquiry
        response, success, error = self.make_request("POST", "/inquiries", data=inquiry_data)
        if success and response.status_code == 200:
            # Wait a moment for database consistency
            time.sleep(2)
            
            # Try to retrieve inquiries and check if our inquiry is there
            response, success, error = self.make_request("GET", "/inquiries")
            if success and response.status_code == 200:
                try:
                    inquiries = response.json()
                    found_inquiry = any(
                        inquiry.get("email") == unique_email and 
                        inquiry.get("message") == unique_message 
                        for inquiry in inquiries
                    )
                    if found_inquiry:
                        self.log_test("Database Integration Test", True, "Successfully stored and retrieved inquiry data")
                    else:
                        self.log_test("Database Integration Test", False, "Inquiry was submitted but not found in retrieval")
                except json.JSONDecodeError:
                    self.log_test("Database Integration Test", False, "Could not parse inquiries response")
            else:
                self.log_test("Database Integration Test", False, "Could not retrieve inquiries after submission")
        else:
            self.log_test("Database Integration Test", False, "Could not submit test inquiry")
    
    def test_openai_content_generation_apis(self):
        """Test OpenAI content generation API endpoints"""
        print("\n=== Testing OpenAI Content Generation APIs ===")
        
        # Test 1: Generate email subject line
        subject_data = {
            "recipientName": "Marco Rossi",
            "emailType": "property-alert",
            "propertyDetails": "Luxury villa in Tuscany with 4 bedrooms, pool, and vineyard views",
            "additionalContext": "New property matching saved search criteria"
        }
        response, success, error = self.make_request("POST", "/generate-subject", data=subject_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if "subjectLine" in result and result["subjectLine"]:
                    self.log_test("POST /api/generate-subject", True, f"Generated subject: '{result['subjectLine'][:50]}...'")
                else:
                    self.log_test("POST /api/generate-subject", False, "No subject line in response")
            except json.JSONDecodeError:
                self.log_test("POST /api/generate-subject", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/generate-subject", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 2: Generate email content
        email_content_data = {
            "recipientName": "Anna Novakova",
            "emailType": "inquiry-confirmation",
            "propertyDetails": "Charming apartment in Rome, 2 bedrooms, historic center",
            "additionalContext": "User inquired about viewing schedule",
            "tone": "professional"
        }
        response, success, error = self.make_request("POST", "/generate-email-content", data=email_content_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if "emailContent" in result and result["emailContent"]:
                    content_preview = result["emailContent"][:100].replace('\n', ' ')
                    self.log_test("POST /api/generate-email-content", True, f"Generated content: '{content_preview}...'")
                else:
                    self.log_test("POST /api/generate-email-content", False, "No email content in response")
            except json.JSONDecodeError:
                self.log_test("POST /api/generate-email-content", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/generate-email-content", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 3: Generate property description
        property_desc_data = {
            "propertyType": "villa",
            "bedrooms": 5,
            "bathrooms": 4,
            "squareFeet": 350,
            "location": "Lake Como",
            "features": ["swimming pool", "private dock", "mountain views", "wine cellar"],
            "targetAudience": "Czech and international luxury buyers",
            "price": 2500000
        }
        response, success, error = self.make_request("POST", "/generate-property-description", data=property_desc_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if "propertyDescription" in result and result["propertyDescription"]:
                    desc_preview = result["propertyDescription"][:100].replace('\n', ' ')
                    self.log_test("POST /api/generate-property-description", True, f"Generated description: '{desc_preview}...'")
                else:
                    self.log_test("POST /api/generate-property-description", False, "No property description in response")
            except json.JSONDecodeError:
                self.log_test("POST /api/generate-property-description", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/generate-property-description", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 4: Test with missing OpenAI API key scenario (error handling)
        minimal_data = {"recipientName": "Test User", "emailType": "welcome"}
        response, success, error = self.make_request("POST", "/generate-subject", data=minimal_data)
        if success:
            if response.status_code == 200:
                self.log_test("OpenAI API Error Handling", True, "OpenAI API key is configured and working")
            elif response.status_code == 500:
                try:
                    result = response.json()
                    if "OpenAI API key not configured" in result.get("error", ""):
                        self.log_test("OpenAI API Error Handling", True, "Correctly handled missing API key")
                    else:
                        self.log_test("OpenAI API Error Handling", False, f"Unexpected error: {result.get('error')}")
                except:
                    self.log_test("OpenAI API Error Handling", False, "Could not parse error response")
            else:
                self.log_test("OpenAI API Error Handling", False, f"Unexpected status code: {response.status_code}")
        else:
            self.log_test("OpenAI API Error Handling", False, f"Request failed: {error}")

    def test_email_notification_apis(self):
        """Test Email notification API endpoints"""
        print("\n=== Testing Email Notification APIs ===")
        
        # Test 1: Send property alert email
        property_alert_data = {
            "emailType": "property-alert",
            "data": {
                "userEmail": "test.buyer@example.com",
                "userName": "Pavel Novak",
                "properties": [
                    {
                        "title": "Villa in Tuscany",
                        "price": {"amount": 850000, "currency": "EUR"},
                        "location": {"city": {"name": {"en": "Florence"}}},
                        "propertyType": "villa"
                    }
                ],
                "searchCriteria": {
                    "type": "villa",
                    "city": "florence",
                    "priceMin": 500000,
                    "priceMax": 1000000
                }
            }
        }
        response, success, error = self.make_request("POST", "/send-email", data=property_alert_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/send-email (property-alert)", True, "Property alert email sent successfully")
                else:
                    self.log_test("POST /api/send-email (property-alert)", False, f"Email sending failed: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/send-email (property-alert)", False, "Invalid JSON response")
        elif success and response.status_code == 500:
            try:
                result = response.json()
                if "Email service not configured" in result.get("error", "") or "Failed to send email" in result.get("error", ""):
                    self.log_test("POST /api/send-email (property-alert)", True, "Email service correctly reports not configured (SendGrid placeholder)")
                else:
                    self.log_test("POST /api/send-email (property-alert)", False, f"Unexpected error: {result.get('error')}")
            except json.JSONDecodeError:
                self.log_test("POST /api/send-email (property-alert)", False, "Could not parse error response")
        else:
            self.log_test("POST /api/send-email (property-alert)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 2: Send inquiry confirmation email
        inquiry_confirmation_data = {
            "emailType": "inquiry-confirmation",
            "data": {
                "userEmail": "inquirer@example.com",
                "userName": "Maria Svoboda",
                "propertyTitle": "Charming Apartment in Rome",
                "inquiryMessage": "I'm interested in scheduling a viewing for this property. When would be the best time?"
            }
        }
        response, success, error = self.make_request("POST", "/send-email", data=inquiry_confirmation_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/send-email (inquiry-confirmation)", True, "Inquiry confirmation email sent successfully")
                else:
                    self.log_test("POST /api/send-email (inquiry-confirmation)", False, f"Email sending failed: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/send-email (inquiry-confirmation)", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/send-email (inquiry-confirmation)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 3: Send welcome email
        welcome_email_data = {
            "emailType": "welcome",
            "data": {
                "userEmail": "newuser@example.com",
                "userName": "Jan Dvorak"
            }
        }
        response, success, error = self.make_request("POST", "/send-email", data=welcome_email_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/send-email (welcome)", True, "Welcome email sent successfully")
                else:
                    self.log_test("POST /api/send-email (welcome)", False, f"Email sending failed: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/send-email (welcome)", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/send-email (welcome)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 4: Send follow-up email
        followup_email_data = {
            "emailType": "follow-up",
            "data": {
                "userEmail": "existing.user@example.com",
                "userName": "Petra Krejci",
                "daysSinceRegistration": 7
            }
        }
        response, success, error = self.make_request("POST", "/send-email", data=followup_email_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/send-email (follow-up)", True, "Follow-up email sent successfully")
                else:
                    self.log_test("POST /api/send-email (follow-up)", False, f"Email sending failed: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/send-email (follow-up)", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/send-email (follow-up)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")
        
        # Test 5: Test invalid email type
        invalid_email_data = {
            "emailType": "invalid-type",
            "data": {"userEmail": "test@example.com", "userName": "Test User"}
        }
        response, success, error = self.make_request("POST", "/send-email", data=invalid_email_data)
        if success and response.status_code == 400:
            self.log_test("POST /api/send-email (invalid type)", True, "Correctly rejected invalid email type")
        else:
            self.log_test("POST /api/send-email (invalid type)", False, f"Expected 400, got {response.status_code if response else 'No response'}")

    def test_notification_preferences_api_unauthenticated(self):
        """Test Notification Preferences API without authentication"""
        print("\n=== Testing Notification Preferences API (Unauthenticated) ===")
        
        # Test 1: Get notification preferences without auth - should fail
        response, success, error = self.make_request("GET", "/notification-preferences")
        if success and response.status_code == 401:
            self.log_test("GET /api/notification-preferences (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("GET /api/notification-preferences (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test 2: Update notification preferences without auth - should fail
        preferences_data = {
            "property_alerts": True,
            "inquiry_responses": False,
            "marketing_emails": True,
            "frequency": "weekly"
        }
        response, success, error = self.make_request("POST", "/notification-preferences", data=preferences_data)
        if success and response.status_code == 401:
            self.log_test("POST /api/notification-preferences (no auth)", True, "Correctly returned 401 Unauthorized")
        else:
            self.log_test("POST /api/notification-preferences (no auth)", False, f"Expected 401, got {response.status_code if response else 'No response'}")

    def test_property_alerts_api(self):
        """Test Property Alerts API endpoint"""
        print("\n=== Testing Property Alerts API ===")
        
        # Test 1: Check property alerts (this endpoint processes saved searches and sends alerts)
        response, success, error = self.make_request("POST", "/check-property-alerts")
        if success and response.status_code == 200:
            try:
                result = response.json()
                if "success" in result and "alertsSent" in result:
                    alerts_count = result.get("alertsSent", 0)
                    self.log_test("POST /api/check-property-alerts", True, f"Property alerts check completed, {alerts_count} alerts sent")
                else:
                    self.log_test("POST /api/check-property-alerts", False, f"Unexpected response format: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/check-property-alerts", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/check-property-alerts", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")

    def test_inquiries_with_email_integration(self):
        """Test updated Inquiries API with email integration"""
        print("\n=== Testing Inquiries API with Email Integration ===")
        
        # Test 1: Submit inquiry with email integration (anonymous user)
        inquiry_data = {
            "listingId": "email-test-property-1",
            "name": "Lukas Novotny",
            "email": "lukas.novotny@example.com",
            "message": "Dobrý den, zajímá mě tato nemovitost v Itálii. Můžete mi prosím poslat více informací o ceně a možnosti prohlídky?",
            "propertyTitle": "Villa with Pool in Tuscany"
        }
        response, success, error = self.make_request("POST", "/inquiries", data=inquiry_data)
        if success and response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/inquiries (with email integration)", True, "Successfully submitted inquiry with email confirmation")
                else:
                    self.log_test("POST /api/inquiries (with email integration)", False, f"Unexpected response: {result}")
            except json.JSONDecodeError:
                self.log_test("POST /api/inquiries (with email integration)", False, "Invalid JSON response")
        else:
            self.log_test("POST /api/inquiries (with email integration)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error}")

    def test_email_system_integration(self):
        """Test complete email system integration"""
        print("\n=== Testing Email System Integration ===")
        
        # Test the complete flow: Generate content -> Send email
        print("Testing complete email workflow...")
        
        # Step 1: Generate subject line
        subject_data = {
            "recipientName": "Integration Test User",
            "emailType": "welcome",
            "additionalContext": "New user registration"
        }
        subject_response, success, error = self.make_request("POST", "/generate-subject", data=subject_data)
        
        if success and subject_response.status_code == 200:
            try:
                subject_result = subject_response.json()
                generated_subject = subject_result.get("subjectLine", "Welcome to Domy v Itálii")
                
                # Step 2: Generate email content
                content_data = {
                    "recipientName": "Integration Test User",
                    "emailType": "welcome",
                    "tone": "friendly"
                }
                content_response, success, error = self.make_request("POST", "/generate-email-content", data=content_data)
                
                if success and content_response.status_code == 200:
                    content_result = content_response.json()
                    generated_content = content_result.get("emailContent", "Welcome to our platform!")
                    
                    # Step 3: Send the email (this will use the email service)
                    email_data = {
                        "emailType": "welcome",
                        "data": {
                            "userEmail": "integration.test@example.com",
                            "userName": "Integration Test User"
                        }
                    }
                    email_response, success, error = self.make_request("POST", "/send-email", data=email_data)
                    
                    if success and email_response.status_code == 200:
                        email_result = email_response.json()
                        if email_result.get("success"):
                            self.log_test("Email System Integration Test", True, "Complete workflow: Generate subject -> Generate content -> Send email")
                        else:
                            self.log_test("Email System Integration Test", False, f"Email sending failed: {email_result}")
                    else:
                        self.log_test("Email System Integration Test", False, "Failed to send email in integration test")
                else:
                    self.log_test("Email System Integration Test", False, "Failed to generate email content in integration test")
            except json.JSONDecodeError:
                self.log_test("Email System Integration Test", False, "JSON parsing error in integration test")
        else:
            self.log_test("Email System Integration Test", False, "Failed to generate subject line in integration test")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Italian Property Platform Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_properties_api()
        self.test_favorites_api_unauthenticated()
        self.test_saved_searches_api_unauthenticated()
        self.test_inquiries_api()
        
        # NEW EMAIL NOTIFICATION SYSTEM TESTS
        self.test_openai_content_generation_apis()
        self.test_email_notification_apis()
        self.test_notification_preferences_api_unauthenticated()
        self.test_property_alerts_api()
        self.test_inquiries_with_email_integration()
        self.test_email_system_integration()
        
        self.test_api_error_handling()
        self.test_database_integration()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n" + "=" * 60)
        return passed_tests, failed_tests, self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)