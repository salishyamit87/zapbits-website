import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user, reusable = false, ephemeral = false, expiration, aclTags = [] } = await request.json();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User is required'
      }, { status: 400 });
    }

    const key = await headscale.createPreAuthKey(user, reusable, ephemeral, expiration, aclTags);
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
    
    // If no user specified, get all keys (admin view)
    const keys = await headscale.listPreAuthKeys(user || undefined);
    return NextResponse.json({
      success: true,
      keys: keys.preAuthKeys || []
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { keyId, user } = await request.json();
    
    if (!keyId || !user) {
      return NextResponse.json({
        success: false,
        error: 'Key ID and user are required'
      }, { status: 400 });
    }

    // For delete, we need the actual key string, not just ID
    // First get all keys to find the specific one
    const allKeys = await headscale.listPreAuthKeys(user);
    const keyToDelete = allKeys.preAuthKeys?.find((k: any) => k.id === keyId);
    
    if (!keyToDelete) {
      return NextResponse.json({
        success: false,
        error: 'Key not found'
      }, { status: 404 });
    }

    await headscale.expirePreAuthKey(user, keyToDelete.key);
    return NextResponse.json({
      success: true,
      message: 'Key expired successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}