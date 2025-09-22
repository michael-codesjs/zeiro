import { NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession } from 'aws-amplify/auth'

const WORKSPACE_API_BASE_URL = process.env.WORKSPACE_API_BASE_URL || 'https://api.zeiro.dev'

export async function GET(request: NextRequest) {
  try {
    // Get the auth session from the request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward the request to the workspace service
    const response = await fetch(`${WORKSPACE_API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Workspace API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch workspaces' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error proxying workspace request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the auth session from the request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()

    // Forward the request to the workspace service
    const response = await fetch(`${WORKSPACE_API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Workspace API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to create workspace' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Error proxying workspace request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
