import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user, reusable = false, ephemeral = false } = await request.json();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User is required'
      }, { status: 400 });
    }

    const key = await headscale.createPreAuthKey(user, reusable, ephemeral);
    return NextResponse.json({
      success: true,
      key: key.preAuthKey,
      message: 'Pre-auth key created successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User parameter is required'
      }, { status: 400 });
    }

    const keys = await headscale.listPreAuthKeys(user);
    return NextResponse.json({
      success: true,
      keys: keys.preAuthKeys
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}