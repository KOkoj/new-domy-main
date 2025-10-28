'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    property_alerts: true,
    inquiry_responses: true,
    onboarding_emails: true,
    marketing_emails: false,
    frequency: 'daily',
    email_enabled: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (key, checked) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
  };

  const handleFrequencyChange = (frequency) => {
    setPreferences(prev => ({ ...prev, frequency }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast.success('Notification preferences updated successfully');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive email notifications from Domy v Itálii
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable all email notifications
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleSwitchChange('email_enabled', checked)}
            />
          </div>

          <div className="space-y-4 opacity-100 transition-opacity" style={{ 
            opacity: preferences.email_enabled ? 1 : 0.5 
          }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Property Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new properties match your saved searches
                </p>
              </div>
              <Switch
                checked={preferences.property_alerts && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('property_alerts', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inquiry Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Receive confirmations when you submit property inquiries
                </p>
              </div>
              <Switch
                checked={preferences.inquiry_responses && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('inquiry_responses', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Onboarding Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Helpful tips and guides for using the platform
                </p>
              </div>
              <Switch
                checked={preferences.onboarding_emails && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('onboarding_emails', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Promotional content and market updates
                </p>
              </div>
              <Switch
                checked={preferences.marketing_emails && preferences.email_enabled}
                onCheckedChange={(checked) => handleSwitchChange('marketing_emails', checked)}
                disabled={!preferences.email_enabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select 
              value={preferences.frequency} 
              onValueChange={handleFrequencyChange}
              disabled={!preferences.email_enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (as they happen)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often you want to receive property alert emails
            </p>
          </div>
        </div>

        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}