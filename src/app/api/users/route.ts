import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Create username from email
    const userName = email.split('@')[0].toLowerCase();
    
    const user = await headscale.createUser(userName);
    
    return NextResponse.json({
      success: true,
      user: user.user,
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