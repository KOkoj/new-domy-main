-- Safe script to add ONLY Premium Club tables
-- This won't conflict with existing tables

-- 1. Client Intake Forms Table
CREATE TABLE IF NOT EXISTS client_intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT,
  phone TEXT,
  email TEXT,
  nationality TEXT,
  current_location TEXT,
  
  -- Property Preferences
  property_types TEXT[],
  preferred_regions TEXT[],
  budget_range TEXT,
  min_bedrooms INTEGER,
  min_bathrooms INTEGER,
  min_square_meters INTEGER,
  
  -- Purchase Details
  timeline TEXT,
  purchase_reason TEXT,
  financing_needed TEXT,
  additional_requirements TEXT,
  
  -- Special Preferences
  must_have_features TEXT[],
  lifestyle_preferences TEXT,
  
  -- Additional Information
  how_did_you_hear TEXT,
  additional_notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'submitted',
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
  status TEXT DEFAULT 'upcoming',
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
  status TEXT DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  attended_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(webinar_id, user_id)
);

-- 4. Premium Documents Table
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

-- 5. Concierge Tickets Table
CREATE TABLE IF NOT EXISTS concierge_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  description TEXT NOT NULL,
  contact_method TEXT DEFAULT 'email',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES concierge_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Premium Content Table
CREATE TABLE IF NOT EXISTS premium_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
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

-- Enable RLS (safe - won't error if already enabled)
ALTER TABLE client_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierge_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can insert their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can update their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Everyone can view webinars" ON webinars;
DROP POLICY IF EXISTS "Users can view their own registrations" ON webinar_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON webinar_registrations;
DROP POLICY IF EXISTS "Users can delete their own registrations" ON webinar_registrations;
DROP POLICY IF EXISTS "Premium members can view documents" ON premium_documents;
DROP POLICY IF EXISTS "Users can view their own tickets" ON concierge_tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON concierge_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON concierge_tickets;
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Users can insert messages to their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Premium members can view content" ON premium_content;

-- Create policies
CREATE POLICY "Users can view their own intake form" ON client_intake_forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intake form" ON client_intake_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intake form" ON client_intake_forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view webinars" ON webinars
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own registrations" ON webinar_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations" ON webinar_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations" ON webinar_registrations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Premium members can view documents" ON premium_documents
  FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own tickets" ON concierge_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON concierge_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON concierge_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their tickets" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM concierge_tickets 
      WHERE concierge_tickets.id = ticket_messages.ticket_id 
      AND concierge_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their tickets" ON ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM concierge_tickets 
      WHERE concierge_tickets.id = ticket_messages.ticket_id 
      AND concierge_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Premium members can view content" ON premium_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_intake_forms_user_id ON client_intake_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_user_id ON webinar_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_webinar_id ON webinar_registrations(webinar_id);
CREATE INDEX IF NOT EXISTS idx_concierge_tickets_user_id ON concierge_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Success message
SELECT 'Premium Club tables created successfully!' as message;

