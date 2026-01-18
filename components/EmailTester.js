'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, Sparkles, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailTester() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');
  const [loading, setLoading] = useState({});
  const [responses, setResponses] = useState({});

  /**
   * Test Welcome Email
   */
  const testWelcomeEmail = async () => {
    setLoading({ ...loading, welcome: true });
    setResponses({ ...responses, welcome: null });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'welcome',
          data: {
            userEmail: testEmail,
            userName: testName
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponses({ 
          ...responses, 
          welcome: { 
            success: true, 
            message: data.message || 'Welcome email sent successfully!',
            aiUsed: data.aiUsed
          } 
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      setResponses({ 
        ...responses, 
        welcome: { 
          success: false, 
          message: error.message 
        } 
      });
    } finally {
      setLoading({ ...loading, welcome: false });
    }
  };

  /**
   * Test Inquiry Confirmation Email
   */
  const testInquiryEmail = async () => {
    setLoading({ ...loading, inquiry: true });
    setResponses({ ...responses, inquiry: null });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'inquiry-confirmation',
          data: {
            userEmail: testEmail,
            userName: testName,
            propertyTitle: 'Luxury Villa in Tuscany',
            inquiryMessage: 'I am very interested in this beautiful property. Could you provide more details about the location and availability?'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponses({ 
          ...responses, 
          inquiry: { 
            success: true, 
            message: data.message || 'Inquiry confirmation sent successfully!',
            aiUsed: data.aiUsed
          } 
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      setResponses({ 
        ...responses, 
        inquiry: { 
          success: false, 
          message: error.message 
        } 
      });
    } finally {
      setLoading({ ...loading, inquiry: false });
    }
  };

  /**
   * Test Property Alert Email
   */
  const testPropertyAlert = async () => {
    setLoading({ ...loading, alert: true });
    setResponses({ ...responses, alert: null });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'property-alert',
          data: {
            userEmail: testEmail,
            userName: testName,
            properties: [
              { title: 'Modern Villa in Florence' },
              { title: 'Charming Apartment in Rome' },
              { title: 'Rustic Farmhouse in Tuscany' }
            ],
            searchCriteria: {
              type: 'villa',
              city: 'Tuscany',
              priceMin: 200000,
              priceMax: 500000,
              bedrooms: 3
            }
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponses({ 
          ...responses, 
          alert: { 
            success: true, 
            message: data.message || 'Property alert sent successfully!',
            aiUsed: data.aiUsed
          } 
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      setResponses({ 
        ...responses, 
        alert: { 
          success: false, 
          message: error.message 
        } 
      });
    } finally {
      setLoading({ ...loading, alert: false });
    }
  };

  /**
   * Trigger Cron Job (Property Alerts)
   */
  const triggerCronJob = async () => {
    setLoading({ ...loading, cron: true });
    setResponses({ ...responses, cron: null });

    try {
      const response = await fetch('/api/cron/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponses({ 
          ...responses, 
          cron: { 
            success: true, 
            message: `Cron job completed: ${data.emailsSent} emails sent, ${data.searchesProcessed} searches processed`,
            details: data
          } 
        });
      } else {
        throw new Error(data.error || 'Cron job failed');
      }
    } catch (error) {
      setResponses({ 
        ...responses, 
        cron: { 
          success: false, 
          message: error.message 
        } 
      });
    } finally {
      setLoading({ ...loading, cron: false });
    }
  };

  const renderResponse = (type) => {
    const response = responses[type];
    if (!response) return null;

    return (
      <Alert className={response.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
        <div className="flex items-start">
          {response.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          )}
          <AlertDescription className="flex-1">
            <div className="font-medium mb-1">
              {response.success ? 'Success!' : 'Error'}
            </div>
            <div className="text-sm">{response.message}</div>
            {response.aiUsed !== undefined && (
              <div className="mt-2">
                <Badge variant={response.aiUsed ? "default" : "secondary"} className="text-xs">
                  {response.aiUsed ? (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Generated Content
                    </>
                  ) : (
                    'Static Template'
                  )}
                </Badge>
              </div>
            )}
            {response.details && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer hover:underline">View details</summary>
                <pre className="mt-2 p-2 bg-white rounded border overflow-auto max-h-40">
                  {JSON.stringify(response.details, null, 2)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span>Email Testing - Concierge Edition</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Test AI-powered email notifications with warm, context-aware content
          </p>
        </div>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">SendGrid Email Service</span>
            <Badge variant={process.env.NEXT_PUBLIC_SENDGRID_CONFIGURED === 'true' ? 'default' : 'secondary'}>
              {process.env.NEXT_PUBLIC_SENDGRID_CONFIGURED === 'true' ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">Google Gemini AI Content Generation</span>
            <Badge variant={process.env.NEXT_PUBLIC_GEMINI_CONFIGURED === 'true' ? 'default' : 'secondary'}>
              {process.env.NEXT_PUBLIC_GEMINI_CONFIGURED === 'true' ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              {process.env.NEXT_PUBLIC_SENDGRID_CONFIGURED !== 'true' && process.env.NEXT_PUBLIC_GEMINI_CONFIGURED !== 'true' ? (
                <>
                  <strong>Demo Mode:</strong> Both SendGrid and Gemini are not configured. 
                  Emails will be logged to console with static templates.
                </>
              ) : process.env.NEXT_PUBLIC_SENDGRID_CONFIGURED !== 'true' ? (
                <>
                  <strong>Simulation Mode:</strong> SendGrid not configured. 
                  Emails will be logged to console but not actually sent.
                </>
              ) : process.env.NEXT_PUBLIC_GEMINI_CONFIGURED !== 'true' ? (
                <>
                  <strong>Static Mode:</strong> Gemini not configured. 
                  Emails will use static templates instead of AI-generated content.
                </>
              ) : (
                <>
                  <strong>Live Mode:</strong> Both services configured. 
                  Emails will be sent with AI-generated content (powered by Google Gemini).
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure recipient details for test emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="testName">Test User Name</Label>
            <Input
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Test User"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Welcome Email
            </CardTitle>
            <CardDescription>
              Test the welcome email sent to new users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testWelcomeEmail}
              disabled={loading.welcome}
              className="w-full"
            >
              {loading.welcome ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Welcome Email
                </>
              )}
            </Button>
            {renderResponse('welcome')}
          </CardContent>
        </Card>

        {/* Inquiry Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-green-600" />
              Inquiry Confirmation
            </CardTitle>
            <CardDescription>
              Test inquiry confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testInquiryEmail}
              disabled={loading.inquiry}
              className="w-full"
            >
              {loading.inquiry ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry Confirmation
                </>
              )}
            </Button>
            {renderResponse('inquiry')}
          </CardContent>
        </Card>

        {/* Property Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              Property Alert
            </CardTitle>
            <CardDescription>
              Test property match alert email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testPropertyAlert}
              disabled={loading.alert}
              className="w-full"
            >
              {loading.alert ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Property Alert
                </>
              )}
            </Button>
            {renderResponse('alert')}
          </CardContent>
        </Card>

        {/* Cron Job Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Trigger Property Alerts (Cron)
            </CardTitle>
            <CardDescription>
              Manually trigger the automated alert system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerCronJob}
              disabled={loading.cron}
              className="w-full"
              variant="secondary"
            >
              {loading.cron ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Run Cron Job
                </>
              )}
            </Button>
            {renderResponse('cron')}
          </CardContent>
        </Card>
      </div>

      {/* Information */}
      <Alert>
        <AlertDescription>
          <strong>How it works:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>If Google Gemini is configured, emails use AI-generated warm, context-aware content (FREE!)</li>
            <li>If Gemini is not available, falls back to professional static templates</li>
            <li>If SendGrid is not configured, emails are logged to console instead of being sent</li>
            <li>The Cron Job checks all saved searches and sends alerts to matching users</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}