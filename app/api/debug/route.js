import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'

export async function GET(request) {
  try {
    console.log('=== DATABASE DEBUG ===')
    
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count(*)')
      .single()
    
    if (testError && testError.code === 'PGRST116') {
      return NextResponse.json({
        error: 'PROFILES_TABLE_NOT_FOUND',
        message: 'The profiles table does not exist. Please run the database setup SQL script.',
        details: testError
      }, { status: 500 })
    }
    
    // Test 2: Check tables exist
    const checks = {
      profiles: null,
      favorites: null,
      saved_searches: null,
      inquiries: null
    }
    
    for (const table of Object.keys(checks)) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        checks[table] = error ? `ERROR: ${error.message}` : 'OK'
      } catch (err) {
        checks[table] = `EXCEPTION: ${err.message}`
      }
    }
    
    // Test 3: Check auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database_connection: 'OK',
      tables: checks,
      auth_status: authError ? `ERROR: ${authError.message}` : 'OK',
      current_user: user ? user.email : 'None',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'DEBUG_FAILED',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json()
    
    if (action === 'test_profile_creation') {
      // Test creating a profile manually
      const testUserId = '12345678-1234-1234-1234-123456789012' // Fake UUID for testing
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: testUserId,
            name: 'Test User',
            role: 'user'
          }
        ])
        .select()
      
      if (error) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        })
      }
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
      
      return NextResponse.json({
        success: true,
        message: 'Profile creation test successful',
        data
      })
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      error: 'POST_DEBUG_FAILED',
      message: error.message
    }, { status: 500 })
  }
}