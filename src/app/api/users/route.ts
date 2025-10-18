import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

// Function to clean username - only allow lowercase letters, numbers, hyphens
const cleanUsername = (email: string) => {
  const username = email.split('@')[0].toLowerCase();
  return username.replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: Request) {
  try {
    const { email, userName: providedUserName } = await request.json();
    
    // Use provided username or generate from email
    const userName = providedUserName || cleanUsername(email);
    
    if (!userName || userName.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address - could not generate valid username'
      }, { status: 400 });
    }

    const user = await headscale.createUser(userName);
    
    return NextResponse.json({
      success: true,
      user: user.user,
      userName: userName,
      message: 'User created successfully in Headscale'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

export async function GET() {
  try {
    const users = await headscale.listUsers();
    return NextResponse.json({
      success: true,
      users: users.users
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}