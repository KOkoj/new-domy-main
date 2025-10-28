'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Sparkles } from 'lucide-react';
import { toast } from "sonner";

export default function EmailTester() {
  const [loading, setLoading] = useState({});
  const [generatedContent, setGeneratedContent] = useState({
    subjectLine: '',
    emailContent: '',
    propertyDescription: ''
  });
  
  const [propertyData, setPropertyData] = useState({
    propertyType: 'villa',
    bedrooms: '3',
    bathrooms: '2',
    squareFeet: '150',
    location: 'Tuscany',
    features: 'Swimming pool, Garden, Terrace, Mountain view',
    targetAudience: 'International buyers looking for vacation homes',
    price: '450000'
  });
  
  const [emailData, setEmailData] = useState({
    recipientName: 'Marco Rossi',
    recipientEmail: 'test@example.com',
    emailType: 'property-listing',
    additionalContext: 'This is a premium property in a sought-after location',
    tone: 'professional'
  });

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  const generatePropertyDescription = async () => {
    setLoading(prev => ({ ...prev, property: true }));
    try {
      const response = await fetch('/api/generate-property-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          features: propertyData.features.split(',').map(f => f.trim()).filter(f => f)
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setGeneratedContent(prev => ({
          ...prev,
          propertyDescription: data.propertyDescription
        }));
        toast.success('Property description generated!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating property description:', error);
      toast.error('Failed to generate property description');
    } finally {
      setLoading(prev => ({ ...prev, property: false }));
    }
  };

  const generateEmailContent = async () => {
    if (!generatedContent.propertyDescription) {
      toast.error('Please generate a property description first');
      return;
    }
    
    setLoading(prev => ({ ...prev, email: true }));
    try {
      // Generate subject line
      const subjectResponse = await fetch('/api/generate-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emailData,
          propertyDetails: generatedContent.propertyDescription
        })
      });
      
      const subjectData = await subjectResponse.json();
      
      // Generate email content
      const contentResponse = await fetch('/api/generate-email-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emailData,
          propertyDetails: generatedContent.propertyDescription
        })
      });
      
      const contentData = await contentResponse.json();
      
      if (subjectResponse.ok && contentResponse.ok) {
        setGeneratedContent(prev => ({
          ...prev,
          subjectLine: subjectData.subjectLine,
          emailContent: contentData.emailContent
        }));
        toast.success('Email content generated!');
      } else {
        throw new Error('Failed to generate email content');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Failed to generate email content');
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const sendTestEmail = async (emailType) => {
    setLoading(prev => ({ ...prev, send: true }));
    try {
      let emailTypeData;
      
      switch (emailType) {
        case 'welcome':
          emailTypeData = {
            emailType: 'welcome',
            data: {
              userEmail: emailData.recipientEmail,
              userName: emailData.recipientName
            }
          };
          break;
        case 'property-alert':
          emailTypeData = {
            emailType: 'property-alert',
            data: {
              userEmail: emailData.recipientEmail,
              userName: emailData.recipientName,
              properties: [{ title: `${propertyData.propertyType} in ${propertyData.location}` }],
              searchCriteria: {
                type: propertyData.propertyType,
                city: propertyData.location,
                priceMax: propertyData.price
              }
            }
          };
          break;
        case 'inquiry-confirmation':
          emailTypeData = {
            emailType: 'inquiry-confirmation',
            data: {
              userEmail: emailData.recipientEmail,
              userName: emailData.recipientName,
              propertyTitle: `${propertyData.propertyType} in ${propertyData.location}`,
              inquiryMessage: 'I am interested in this beautiful property. Please send me more information.'
            }
          };
          break;
        default:
          throw new Error('Invalid email type');
      }
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailTypeData)
      });
      
      if (response.ok) {
        toast.success(`Test ${emailType} email sent successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error(`Failed to send test ${emailType} email: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, send: false }));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Mail className="h-8 w-8 text-blue-600" />
          <span>Email Notification System</span>
        </h1>
        <p className="text-muted-foreground">
          Test and preview AI-generated email content for Italian property notifications
        </p>
      </div>

      <Tabs defaultValue="property" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="property">Property Details</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="send">Send Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Enter details about the Italian property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select value={propertyData.propertyType} onValueChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="farmhouse">Farmhouse</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Location</Label>
                  <Input
                    name="location"
                    value={propertyData.location}
                    onChange={handlePropertyChange}
                    placeholder="e.g. Tuscany, Amalfi Coast, Lake Como"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Input
                    name="bedrooms"
                    type="number"
                    value={propertyData.bedrooms}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input
                    name="bathrooms"
                    type="number"
                    value={propertyData.bathrooms}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div>
                  <Label>Size (m²)</Label>
                  <Input
                    name="squareFeet"
                    type="number"
                    value={propertyData.squareFeet}
                    onChange={handlePropertyChange}
                  />
                </div>
              </div>
              
              <div>
                <Label>Price (€)</Label>
                <Input
                  name="price"
                  type="number"
                  value={propertyData.price}
                  onChange={handlePropertyChange}
                  placeholder="450000"
                />
              </div>
              
              <div>
                <Label>Features (comma-separated)</Label>
                <Textarea
                  name="features"
                  value={propertyData.features}
                  onChange={handlePropertyChange}
                  placeholder="Swimming pool, Garden, Terrace, Sea view"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Target Audience</Label>
                <Input
                  name="targetAudience"
                  value={propertyData.targetAudience}
                  onChange={handlePropertyChange}
                  placeholder="International buyers, families, retirees"
                />
              </div>
              
              <Button 
                onClick={generatePropertyDescription} 
                disabled={loading.property}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {loading.property ? 'Generating...' : 'Generate Property Description'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Set up email recipient and content preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipient Name</Label>
                  <Input
                    name="recipientName"
                    value={emailData.recipientName}
                    onChange={handleEmailChange}
                    placeholder="Marco Rossi"
                  />
                </div>
                
                <div>
                  <Label>Recipient Email</Label>
                  <Input
                    name="recipientEmail"
                    type="email"
                    value={emailData.recipientEmail}
                    onChange={handleEmailChange}
                    placeholder="test@example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email Type</Label>
                <Select value={emailData.emailType} onValueChange={(value) => setEmailData(prev => ({ ...prev, emailType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property-listing">Property Listing</SelectItem>
                    <SelectItem value="property-alert">Property Alert</SelectItem>
                    <SelectItem value="price-change">Price Change</SelectItem>
                    <SelectItem value="new-listing">New Listing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tone</Label>
                <Select value={emailData.tone} onValueChange={(value) => setEmailData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Additional Context</Label>
                <Textarea
                  name="additionalContext"
                  value={emailData.additionalContext}
                  onChange={handleEmailChange}
                  placeholder="Special offers, market insights, urgency factors..."
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generateEmailContent} 
                disabled={loading.email || !generatedContent.propertyDescription}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {loading.email ? 'Generating...' : 'Generate Email Content'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Description</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent.propertyDescription ? (
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
                    {generatedContent.propertyDescription}
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                    No property description generated yet
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Subject Line</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent.subjectLine ? (
                  <div className="p-4 bg-muted rounded-lg">
                    {generatedContent.subjectLine}
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                    No subject line generated yet
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent.emailContent ? (
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-line">
                    {generatedContent.emailContent}
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                    No email content generated yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Emails</CardTitle>
              <CardDescription>
                Test different email notification types. 
                <Badge variant="secondary" className="ml-2">
                  {process.env.SENDGRID_API_KEY === 'placeholder_will_be_added_later' ? 'Simulation Mode' : 'Live Mode'}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  onClick={() => sendTestEmail('welcome')}
                  disabled={loading.send}
                  variant="outline"
                  className="justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Welcome Email
                </Button>
                
                <Button 
                  onClick={() => sendTestEmail('property-alert')}
                  disabled={loading.send}
                  variant="outline"
                  className="justify-start"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Property Alert
                </Button>
                
                <Button 
                  onClick={() => sendTestEmail('inquiry-confirmation')}
                  disabled={loading.send}
                  variant="outline"
                  className="justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Inquiry Confirmation
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Test emails will be sent to <code>{emailData.recipientEmail}</code>
                  {process.env.SENDGRID_API_KEY === 'placeholder_will_be_added_later' && 
                    '. Currently in simulation mode - emails won\'t actually be sent until SendGrid is configured.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}