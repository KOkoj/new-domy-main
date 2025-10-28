import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        profile: existingProfile 
      })
    }

    // Create the profile manually
    const profileData = {
      id: user.id,
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'user'
    }

    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: profileError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile 
    })

  } catch (error) {
    console.error('Profile creation exception:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, try to create it
      if (profileError.code === 'PGRST116') {
        // Call the POST method to create profile
        return await POST(request)
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        details: profileError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    })

  } catch (error) {
    console.error('Profile fetch exception:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}