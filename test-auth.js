// Test script for authentication - Run in browser console
// This will help you test the login functionality

async function testAuthentication() {
  console.log('🔐 Testing Italian Property Platform Authentication')
  console.log('================================================')
  
  try {
    // Test creating a user account
    console.log('1. Testing account creation...')
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    })

    if (signUpError) {
      console.log('❌ Signup Error:', signUpError.message)
    } else {
      console.log('✅ Account created successfully!')
      console.log('📧 Check your email for confirmation (if using real email)')
    }

    // Test login
    console.log('\\n2. Testing login...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })

    if (loginError) {
      console.log('❌ Login Error:', loginError.message)
    } else {
      console.log('✅ Login successful!')
      console.log('👤 User:', loginData.user.email)
    }

    // Test getting current user
    console.log('\\n3. Testing user session...')
    
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ User Error:', userError.message)
    } else if (userData.user) {
      console.log('✅ User session active!')
      console.log('📧 Email:', userData.user.email)
      console.log('👤 Name:', userData.user.user_metadata?.name)
    } else {
      console.log('ℹ️ No active user session')
    }

    // Test logout
    console.log('\\n4. Testing logout...')
    
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.log('❌ Logout Error:', logoutError.message)
    } else {
      console.log('✅ Logout successful!')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  console.log('\\n================================================')
  console.log('🎉 Authentication test completed!')
  console.log('\\nTo test manually:')
  console.log('1. Click the "Login" button in the navigation')
  console.log('2. Switch to "Sign Up" tab')
  console.log('3. Create an account with your email')
  console.log('4. Check your email for confirmation')
  console.log('5. Return and login with your credentials')
}

// Run the test
testAuthentication()