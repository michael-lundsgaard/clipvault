'use server';

import { insertVideo, listVideosWithRelations, markVideoCompleted } from '@/entities/video/model/video.db';
import { presignVideoUpload } from '@/entities/video/model/video.storage';
import { nanoid } from 'nanoid';

const ANONYMOUS_USER_ID = 'anonymous';

type CreateVideoInitArgs = {
	filename: string;
	sizeBytes: number;
	mimeType?: string;
	uploadedBy?: string; // optional until auth is implemented
	categoryId?: string;
};

export type CreateVideoInitResult = {
	id: string;
	storageKey: string;
	uploadUrl: string;
};

export async function createVideoInitAction(args: CreateVideoInitArgs): Promise<CreateVideoInitResult> {
	const { filename, sizeBytes, mimeType = 'video/mp4', uploadedBy, categoryId } = args;

	const id = nanoid(11);
	const storageKey = `${id}.mp4`;

	const uploadUrl = await presignVideoUpload(storageKey, mimeType);

	await insertVideo({
		id,
		originalFilename: filename,
		storageKey,
		sizeBytes,
		durationSeconds: 0,
		uploadedBy: uploadedBy ?? ANONYMOUS_USER_ID,
		categoryId,
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
	return listVideosWithRelations();
}
