import { headscale } from '@/lib/headscale'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test users list
    const users = await headscale.listUsers()
    
    // Test nodes list
    const nodes = await headscale.listNodes()
    
    return NextResponse.json({
      success: true,
      apiStatus: 'Working',
      usersCount: users.users?.length || 0,
      nodesCount: nodes.nodes?.length || 0,
      message: 'Headscale API is connected successfully!'
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      message: 'Headscale API connection failed'
    }, { status: 400 })
  }
}