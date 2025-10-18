import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const acl = await headscale.getACL();
    return NextResponse.json({
      success: true,
      acl
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const acl = await request.json();
    const result = await headscale.setACL(acl);
    return NextResponse.json({
      success: true,
      result,
      message: 'ACL configuration saved successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}