import { headscale } from '@/lib/headscale';
import { NextResponse } from 'next/server';

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

    const nodes = await headscale.listUserNodes(user);
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

export async function DELETE(request: Request) {
  try {
    const { nodeId } = await request.json();
    
    if (!nodeId) {
      return NextResponse.json({
        success: false,
        error: 'Node ID is required'
      }, { status: 400 });
    }

    await headscale.deleteNode(nodeId);
    return NextResponse.json({
      success: true,
      message: 'Node deleted successfully'
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
    const { nodeId, action, newName } = await request.json();
    
    if (!nodeId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Node ID and action are required'
      }, { status: 400 });
    }

    if (action === 'expire') {
      await headscale.expireNode(nodeId);
      return NextResponse.json({
        success: true,
        message: 'Node expired successfully'
      });
    } else if (action === 'rename' && newName) {
      await headscale.renameNode(nodeId, newName);
      return NextResponse.json({
        success: true,
        message: 'Node renamed successfully'
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