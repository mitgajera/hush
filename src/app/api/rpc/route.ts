import { NextRequest, NextResponse } from 'next/server'

// Server-only — never sent to the browser bundle
const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  'https://api.devnet.solana.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'RPC proxy error' },
      { status: 502 }
    )
  }
}
