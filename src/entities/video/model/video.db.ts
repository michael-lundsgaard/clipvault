import { db, videos } from '@/shared/lib/db';
import { and, desc, eq } from 'drizzle-orm';
import type { NewVideoRow, VideoWithRelations } from './video.types';

export async function insertVideo(video: NewVideoRow) {
	return db.insert(videos).values(video).returning();
}

export async function listVideos(options?: {
	categoryId?: string | null;
	uploadedBy?: string | null;
	compressed?: boolean;
}) {
	const filters = [];

	if (typeof options?.categoryId === 'string') filters.push(eq(videos.categoryId, options.categoryId));
	if (typeof options?.uploadedBy === 'string') filters.push(eq(videos.uploadedBy, options.uploadedBy));
	if (typeof options?.compressed === 'boolean') filters.push(eq(videos.compressed, options.compressed));

	const conditions = filters.length ? and(...filters) : undefined;

	return db.select().from(videos).where(conditions).orderBy(desc(videos.createdAt));
}

export async function listVideosWithRelations(options?: {
	categoryId?: string | null;
	uploadedBy?: string | null;
	compressed?: boolean;
}): Promise<VideoWithRelations[]> {
	const filters = [];

	if (typeof options?.categoryId === 'string') filters.push(eq(videos.categoryId, options.categoryId));
	if (typeof options?.uploadedBy === 'string') filters.push(eq(videos.uploadedBy, options.uploadedBy));
	if (typeof options?.compressed === 'boolean') filters.push(eq(videos.compressed, options.compressed));

	const conditions = filters.length ? and(...filters) : undefined;

	const rows = await db.query.videos.findMany({
		where: conditions,
		orderBy: (v, { desc }) => desc(v.createdAt),
		with: {
			uploader: true,
			category: true,
		},
	});

	return rows;
}

export async function getVideoById(id: string) {
	const [row] = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
	return row ?? null;
}

export async function getVideoByIdWithRelations(id: string): Promise<VideoWithRelations | null> {
	const row = await db.query.videos.findFirst({
		where: (v, { eq }) => eq(v.id, id),
		with: {
			uploader: true,
			category: true,
		},
	});

	if (!row) return null;

	return row;
}

export async function markVideoCompleted(
	id: string,
	updates?: { durationSeconds?: number; sizeBytes?: number; completedAt?: Date }
) {
	return db
		.update(videos)
		.set({
			status: 'ready',
			completedAt: updates?.completedAt ?? new Date(),
			durationSeconds: updates?.durationSeconds,
			sizeBytes: updates?.sizeBytes,
		})
		.where(eq(videos.id, id));
}
