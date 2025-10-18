import { headscale } from '@/lib/headscale'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test users list
    const users = await headscale.listUsers()
    
    // Test nodes list (get all nodes for test)
    const allNodes = await headscale.listUsers()
    let nodesCount = 0
    if (allNodes.users) {
      for (const user of allNodes.users) {
        const userNodes = await headscale.listUserNodes(user.name)
        nodesCount += userNodes.nodes?.length || 0
      }
    }
    
    return NextResponse.json({
      success: true,
      apiStatus: 'Working',
      usersCount: users.users?.length || 0,
      nodesCount: nodesCount,
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