import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    
    if (!q) {
        return new NextResponse("Missing query", { status: 400 });
    }

    try {
        const decodedUrl = Buffer.from(q, 'base64').toString('utf-8');
        const imageRes = await fetch(decodedUrl);
        
        if (!imageRes.ok) {
            return new NextResponse("Failed to fetch image", { status: imageRes.status });
        }

        const contentType = imageRes.headers.get('content-type') || 'image/png';
        const buffer = await imageRes.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        return new NextResponse("Invalid request", { status: 500 });
    }
}
