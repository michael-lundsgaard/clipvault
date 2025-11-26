'use server';

import { insertVideo, listVideos, markVideoCompleted } from '@/entities/video/model/video.db';
import { presignVideoUpload } from '@/entities/video/model/video.storage';

type CreateVideoInitArgs = {
	filename: string;
	sizeBytes: number;
	mimeType?: string;
	uploadedBy?: string;
	category?: string;
};

export type CreateVideoInitResult = {
	id: string;
	storedFilename: string;
	uploadUrl: string;
};

export async function createVideoInitAction(args: CreateVideoInitArgs): Promise<CreateVideoInitResult> {
	const { filename, sizeBytes, mimeType = 'video/mp4', uploadedBy, category } = args;

	const id = crypto.randomUUID();
	const storedFilename = `${id}-${filename}`;

	const uploadUrl = await presignVideoUpload(storedFilename, mimeType, 3600);

	await insertVideo({
		id,
		originalFilename: filename,
		storedFilename,
		sizeBytes,
		durationSeconds: 0,
		uploadedBy,
		category,
		status: 'pending',
	});

	return {
		id,
		storedFilename,
		uploadUrl,
	};
}

export async function confirmUploadAction(
	videoId: string,
	metadata?: { durationSeconds?: number; sizeBytes?: number }
) {
	await markVideoCompleted(videoId, {
		durationSeconds: metadata?.durationSeconds,
		sizeBytes: metadata?.sizeBytes,
		completedAt: new Date(),
	});
}

export async function listVideosAction() {
	return listVideos();
}
