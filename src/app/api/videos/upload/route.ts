import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { insertVideo } from '../../../../../db/queries';

export async function POST(req: Request) {
	const body = await req.json();

	const id = crypto.randomUUID();
	const storedFilename = `${id}-${body.filename}`;

	await insertVideo({
		id,
		originalFilename: body.filename,
		storedFilename,
		sizeBytes: body.sizeBytes,
		durationSeconds: body.durationSeconds ?? 0,
		uploadedBy: body.uploadedBy,
		category: body.category ?? null,
		compressed: false,
	});

	const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload-url`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			storedFilename,
			mimeType: 'video/mp4',
			sizeBytes: body.sizeBytes,
		}),
	});

	const { uploadId, presignedUrls } = await uploadResponse.json();

	return NextResponse.json({
		id,
		storedFilename,
		uploadUrl: presignedUrls,
		uploadId,
	});
}
