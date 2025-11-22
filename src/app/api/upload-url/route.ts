import { NextResponse } from 'next/server';
import { presignPutObject } from '../../../lib/storage/b2-client';

export async function POST(req: Request) {
	try {
		const { storedFilename, mimeType = 'video/mp4' } = await req.json();

		const url = await presignPutObject(storedFilename, mimeType);

		return NextResponse.json({
			uploadId: null,
			presignedUrls: url,
		});
	} catch (error) {
		console.error('Error generating upload URL:', error);
		return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
	}
}
