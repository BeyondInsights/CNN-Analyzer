import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    nodeEnv: process.env.NODE_ENV,
    apiKeyFirst4: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 4) || 'MISSING',
  });
}
