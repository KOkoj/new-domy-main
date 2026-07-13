-- Add email notification functionality to the database

-- 1. Add notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_alerts BOOLEAN DEFAULT true,
  inquiry_responses BOOLEAN DEFAULT true,
  onboarding_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  email_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. Add last_alert_sent column to saved_searches table
ALTER TABLE saved_searches 
ADD COLUMN IF NOT EXISTS last_alert_sent TIMESTAMP WITH TIME ZONE;

-- 3. Add email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  error_message TEXT,
  metadata JSONB
);

-- 4. Enable RLS on new tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences" ON notification_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for email_logs (users can only see their own email logs)
CREATE POLICY "Users can view their own email logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_saved_searches_last_alert_sent ON saved_searches(last_alert_sent);

-- 8. Create function to automatically create notification preferences when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, property_alerts, inquiry_responses, onboarding_emails, marketing_emails, frequency, email_enabled)
  VALUES (
    NEW.id,
    true,  -- property_alerts
    true,  -- inquiry_responses  
    true,  -- onboarding_emails
    false, -- marketing_emails
    'daily', -- frequency
    true   -- email_enabled
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to automatically create notification preferences for new users
DROP TRIGGER IF EXISTS on_auth_user_created_notification_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notification_preferences();

-- 10. Create function to log email sends
CREATE OR REPLACE FUNCTION public.log_email_send(
  p_user_id UUID,
  p_email_type VARCHAR(50),
  p_recipient_email VARCHAR(255),
  p_subject VARCHAR(255),
  p_status VARCHAR(20) DEFAULT 'sent',
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) 
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.email_logs (
    user_id, 
    email_type, 
    recipient_email, 
    subject, 
    status, 
    error_message, 
    metadata
  )
  VALUES (
    p_user_id,
    p_email_type,
    p_recipient_email,
    p_subject,
    p_status,
    p_error_message,
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO anon, authenticated;
GRANT ALL ON public.email_logs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_notification_preferences() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_email_send TO anon, authenticated;