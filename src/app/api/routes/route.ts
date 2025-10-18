import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const routes = await headscale.listRoutes();
    return NextResponse.json({
      success: true,
      routes: routes.routes || []
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
    const { routeId, action } = await request.json();
    
    if (!routeId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Route ID and action are required'
      }, { status: 400 });
    }

    if (action === 'enable') {
      await headscale.enableRoute(routeId);
      return NextResponse.json({
        success: true,
        message: 'Route enabled successfully'
      });
    } else if (action === 'disable') {
      await headscale.disableRoute(routeId);
      return NextResponse.json({
        success: true,
        message: 'Route disabled successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
    }
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
    const { routeId } = await request.json();
    
    if (!routeId) {
      return NextResponse.json({
        success: false,
        error: 'Route ID is required'
      }, { status: 400 });
    }

    await headscale.deleteRoute(routeId);
    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}