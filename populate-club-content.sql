-- Populate Premium Club Content and Webinars with initial data
-- Run this in Supabase SQL Editor

-- 1. Insert Webinars
INSERT INTO webinars (title, description, date, time, duration, speaker_name, speaker_title, category, max_spots, status)
VALUES
  (
    'Italian Property Market Trends 2025',
    'Comprehensive overview of the current Italian real estate market, emerging trends, and investment opportunities across different regions.',
    '2025-10-15',
    '14:00 CET',
    '90 minutes',
    'Maria Rossi',
    'Senior Real Estate Analyst',
    'Market Insights',
    15,
    'upcoming'
  ),
  (
    'Tax Benefits for Foreign Property Owners',
    'Learn about tax advantages, deductions, and fiscal incentives available to international buyers purchasing property in Italy.',
    '2025-10-22',
    '16:00 CET',
    '60 minutes',
    'Giovanni Bianchi',
    'Tax Consultant',
    'Legal & Tax',
    20,
    'upcoming'
  ),
  (
    'Restoration & Renovation Guide',
    'Expert guidance on renovating historical Italian properties, navigating permits, working with local contractors, and preserving authenticity.',
    '2025-10-29',
    '15:00 CET',
    '75 minutes',
    'Alessandra Conti',
    'Architectural Consultant',
    'Renovation',
    18,
    'upcoming'
  ),
  (
    'Financing Your Italian Dream Home',
    'Understanding mortgage options, international financing, currency considerations, and working with Italian banks.',
    '2025-11-05',
    '13:00 CET',
    '60 minutes',
    'Franco Lombardi',
    'Mortgage Specialist',
    'Financing',
    25,
    'upcoming'
  ),
  (
    'Legal Framework for Property Purchase in Italy',
    'Complete guide to the Italian property buying process, legal requirements, and necessary documentation.',
    '2025-09-18',
    '14:00 CET',
    '90 minutes',
    'Lucia Ferrari',
    'Real Estate Attorney',
    'Legal & Tax',
    50,
    'completed'
  ),
  (
    'Living in Tuscany: A Complete Guide',
    'Discover the lifestyle, culture, and practical aspects of living in one of Italy''s most beloved regions.',
    '2025-09-10',
    '16:00 CET',
    '60 minutes',
    'Marco Benedetti',
    'Regional Expert',
    'Lifestyle',
    50,
    'completed'
  ),
  (
    'Property Management for Absentee Owners',
    'How to effectively manage your Italian property when you''re not there, including rental opportunities.',
    '2025-08-25',
    '15:00 CET',
    '75 minutes',
    'Silvia Martini',
    'Property Manager',
    'Management',
    50,
    'completed'
  );

-- 2. Insert Premium Content (Videos)
INSERT INTO premium_content (title, description, content_type, category, duration, view_count, published_at, thumbnail_url)
VALUES
  (
    'Complete Guide to Buying Property in Italy',
    'Step-by-step walkthrough of the entire property purchase process in Italy',
    'video',
    'Guides',
    '45:23',
    1247,
    '2025-09-15',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9'
  ),
  (
    'Virtual Tour: Luxury Villas in Tuscany',
    'Exclusive virtual tours of our premium properties in the Tuscan countryside',
    'video',
    'Property Tours',
    '28:17',
    892,
    '2025-09-10',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  ),
  (
    'Renovation Success Stories',
    'Case studies of successful property renovations by our clients',
    'video',
    'Case Studies',
    '32:45',
    654,
    '2025-09-01',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e'
  ),
  (
    'Living the Italian Dream: Expat Experiences',
    'Interviews with expats who successfully relocated to Italy',
    'video',
    'Lifestyle',
    '41:12',
    1089,
    '2025-08-20',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9'
  );

-- 3. Insert Premium Content (Guides)
INSERT INTO premium_content (title, description, content_type, category, pages, download_count, published_at)
VALUES
  (
    'The Ultimate Italian Property Buyer''s Guide',
    'Comprehensive 50-page guide covering everything from searching to closing',
    'guide',
    'Buying Guides',
    50,
    342,
    '2025-09-01'
  ),
  (
    'Regional Investment Analysis 2025',
    'In-depth analysis of investment opportunities across all Italian regions',
    'guide',
    'Market Reports',
    35,
    287,
    '2025-08-15'
  ),
  (
    'Renovation & Restoration Handbook',
    'Expert guide to renovating Italian properties while preserving character',
    'guide',
    'Renovation',
    42,
    198,
    '2025-08-01'
  ),
  (
    'Regional Lifestyle Guide',
    'Discover the unique culture, cuisine, and lifestyle of each Italian region',
    'guide',
    'Lifestyle',
    28,
    421,
    '2025-07-15'
  );

-- 4. Insert Premium Content (Articles)
INSERT INTO premium_content (title, description, content_type, category, read_time, view_count, author, published_at)
VALUES
  (
    'Top 10 Emerging Property Markets in Italy for 2025',
    'Discover the Italian regions showing the most promise for property investment this year...',
    'article',
    'Market Insights',
    '8 min read',
    2341,
    'Maria Rossi',
    '2025-10-01'
  ),
  (
    'Tax Advantages for Foreign Property Buyers',
    'Understanding the fiscal benefits and incentives available to international buyers...',
    'article',
    'Legal & Tax',
    '6 min read',
    1876,
    'Giovanni Bianchi',
    '2025-09-28'
  ),
  (
    'Navigating Italian Property Law: A Primer',
    'Essential legal knowledge every foreign buyer should have before purchasing...',
    'article',
    'Legal & Tax',
    '10 min read',
    1542,
    'Lucia Ferrari',
    '2025-09-20'
  );
