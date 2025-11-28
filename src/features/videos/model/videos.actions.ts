'use server';

import { insertVideo, listVideos, markVideoCompleted } from '@/entities/video/model/video.db';
import { presignVideoUpload } from '@/entities/video/model/video.storage';
import { nanoid } from 'nanoid';

type CreateVideoInitArgs = {
	filename: string;
	sizeBytes: number;
	mimeType?: string;
	uploadedBy?: string;
	category?: string;
};

export type CreateVideoInitResult = {
	id: string;
	storageKey: string;
	uploadUrl: string;
};

export async function createVideoInitAction(args: CreateVideoInitArgs): Promise<CreateVideoInitResult> {
	const { filename, sizeBytes, mimeType = 'video/mp4', uploadedBy, category } = args;

	const id = nanoid(11);
	const storageKey = `${id}.mp4`;

	const uploadUrl = await presignVideoUpload(storageKey, mimeType);

	await insertVideo({
		id,
		originalFilename: filename,
		storageKey,
		sizeBytes,
		durationSeconds: 0,
		uploadedBy,
		category,
		status: 'pending',
	});

	return {
		id,
		storageKey,
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
