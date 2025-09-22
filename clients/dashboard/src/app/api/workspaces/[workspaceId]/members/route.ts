import { NextRequest, NextResponse } from 'next/server'

const WORKSPACE_API_BASE_URL = process.env.WORKSPACE_API_BASE_URL || 'https://api.zeiro.dev'

interface RouteContext {
  params: {
    workspaceId: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { workspaceId } = params
    
    // Get the auth session from the request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward the request to the workspace service
    const response = await fetch(`${WORKSPACE_API_BASE_URL}/workspaces/${workspaceId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Workspace members API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch workspace members' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error proxying workspace members request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
