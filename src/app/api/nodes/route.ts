import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const nodes = await headscale.listNodes();
    return NextResponse.json({
      success: true,
      nodes: nodes.nodes
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}