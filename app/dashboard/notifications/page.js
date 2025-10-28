'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationPreferences from '@/components/NotificationPreferences';
import { Bell, Mail, Settings } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage your email notification preferences and stay updated on your Italian property search
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-slate-800" />
              <span>Property Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get notified when new properties match your saved search criteria
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Inquiry Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Receive confirmations and updates about your property inquiries
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <span>Tips & Guides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Helpful onboarding content and Italian property market insights
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <NotificationPreferences />
    </div>
  );
}