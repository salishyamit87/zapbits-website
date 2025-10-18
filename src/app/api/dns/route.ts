import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dns = await headscale.getDNSConfig();
    return NextResponse.json({
      success: true,
      dns
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
    const dnsConfig = await request.json();
    const result = await headscale.setDNSConfig(dnsConfig);
    return NextResponse.json({
      success: true,
      result,
      message: 'DNS configuration saved successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}