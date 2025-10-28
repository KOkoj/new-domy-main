-- Run this in Supabase SQL Editor to check what's already set up
-- This will show you which tables exist

SELECT 
  tablename,
  'EXISTS' as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles',
    'favorites', 
    'saved_searches',
    'inquiries',
    'notification_preferences',
    'email_logs',
    'client_intake_forms',
    'webinars',
    'webinar_registrations',
    'premium_documents',
    'document_access_logs',
    'concierge_tickets',
    'ticket_messages',
    'premium_content',
    'content_access_logs'
  )
ORDER BY tablename;

