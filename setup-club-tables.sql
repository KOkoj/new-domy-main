-- Premium Club Database Schema Setup
-- Run this to create the necessary tables for the Club section (Webinars, Content, etc.)

-- 1. Client Intake Forms Table
CREATE TABLE IF NOT EXISTS client_intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  nationality TEXT,
  current_location TEXT,
  property_types TEXT[],
  preferred_regions TEXT[],
  budget_range TEXT,
  min_bedrooms INTEGER,
  min_bathrooms INTEGER,
  min_square_meters INTEGER,
  timeline TEXT,
  purchase_reason TEXT,
  financing_needed TEXT,
  additional_requirements TEXT,
  must_have_features TEXT[],
  lifestyle_preferences TEXT,
  how_did_you_hear TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'processed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. Webinars Table
CREATE TABLE IF NOT EXISTS webinars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  speaker_avatar TEXT,
  category TEXT,
  max_spots INTEGER DEFAULT 50,
  current_registrations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  meeting_link TEXT,
  recording_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Webinar Registrations Table
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar_id UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  attended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(webinar_id, user_id)
);

-- 4. Premium Documents Table (Ensure it exists)
CREATE TABLE IF NOT EXISTS premium_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Document Access Log Table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES premium_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Concierge Tickets Table
CREATE TABLE IF NOT EXISTS concierge_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  description TEXT NOT NULL,
  contact_method TEXT DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'video')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES concierge_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Premium Content Table (Videos, Guides, Articles)
CREATE TABLE IF NOT EXISTS premium_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'guide', 'article')),
  category TEXT,
  thumbnail_url TEXT,
  content_url TEXT,
  file_url TEXT,
  duration TEXT,
  pages INTEGER,
  read_time TEXT,
  author TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Content Access Log Table
CREATE TABLE IF NOT EXISTS content_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES premium_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'complete')),
  duration_seconds INTEGER,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Add membership tier to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium', 'vip'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_start_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_end_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_end_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE client_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierge_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can insert their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can update their own intake form" ON client_intake_forms;

DROP POLICY IF EXISTS "Everyone can view webinars" ON webinars;

DROP POLICY IF EXISTS "Users can view their own registrations" ON webinar_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON webinar_registrations;
DROP POLICY IF EXISTS "Users can delete their own registrations" ON webinar_registrations;

DROP POLICY IF EXISTS "Premium members can view documents" ON premium_documents;
DROP POLICY IF EXISTS "Authenticated users can view premium documents" ON premium_documents;

DROP POLICY IF EXISTS "Users can view their own access logs" ON document_access_logs;
DROP POLICY IF EXISTS "Users can insert their own access logs" ON document_access_logs;

DROP POLICY IF EXISTS "Users can view their own tickets" ON concierge_tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON concierge_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON concierge_tickets;

DROP POLICY IF EXISTS "Users can view messages from their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Users can insert messages to their tickets" ON ticket_messages;

DROP POLICY IF EXISTS "Premium members can view content" ON premium_content;
DROP POLICY IF EXISTS "Authenticated users can view premium content" ON premium_content;
DROP POLICY IF EXISTS "Admins can manage content" ON premium_content;

DROP POLICY IF EXISTS "Users can view their own content access logs" ON content_access_logs;
DROP POLICY IF EXISTS "Users can insert their own content access logs" ON content_access_logs;

-- Re-create Policies

-- client_intake_forms
CREATE POLICY "Users can view their own intake form" ON client_intake_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own intake form" ON client_intake_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own intake form" ON client_intake_forms FOR UPDATE USING (auth.uid() = user_id);

-- webinars
CREATE POLICY "Everyone can view webinars" ON webinars FOR SELECT USING (true);

-- webinar_registrations
CREATE POLICY "Users can view their own registrations" ON webinar_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own registrations" ON webinar_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own registrations" ON webinar_registrations FOR DELETE USING (auth.uid() = user_id);

-- premium_documents
-- Note: Keeping it broader for now to avoid 'empty' issues during testing, or restrict to premium if preferred.
-- Let's use the premium restriction as per design, but ensure the user has a tier.
CREATE POLICY "Premium members can view documents" ON premium_documents
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.membership_tier IN ('premium', 'vip')
    )
  );

-- document_access_logs
CREATE POLICY "Users can view their own access logs" ON document_access_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own access logs" ON document_access_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- concierge_tickets
CREATE POLICY "Users can view their own tickets" ON concierge_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tickets" ON concierge_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON concierge_tickets FOR UPDATE USING (auth.uid() = user_id);

-- ticket_messages
CREATE POLICY "Users can view messages from their tickets" ON ticket_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM concierge_tickets 
      WHERE concierge_tickets.id = ticket_messages.ticket_id 
      AND concierge_tickets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert messages to their tickets" ON ticket_messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM concierge_tickets 
      WHERE concierge_tickets.id = ticket_messages.ticket_id 
      AND concierge_tickets.user_id = auth.uid()
    )
  );

// RLS Policies for premium_content
CREATE POLICY "Admins can manage content" ON premium_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Premium members can view content" ON premium_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.membership_tier IN ('premium', 'vip') OR profiles.role = 'admin')
    )
  );

-- content_access_logs
CREATE POLICY "Users can view their own content access logs" ON content_access_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content access logs" ON content_access_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_webinars_updated_at ON webinars;
CREATE TRIGGER update_webinars_updated_at BEFORE UPDATE ON webinars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_content_updated_at ON premium_content;
CREATE TRIGGER update_premium_content_updated_at BEFORE UPDATE ON premium_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_concierge_tickets_updated_at ON concierge_tickets;
CREATE TRIGGER update_concierge_tickets_updated_at BEFORE UPDATE ON concierge_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

