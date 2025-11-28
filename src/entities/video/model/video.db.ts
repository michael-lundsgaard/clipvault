import { db, videos } from '@/shared/lib/db';
import { and, desc, eq } from 'drizzle-orm';

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export async function insertVideo(video: NewVideo) {
	return db.insert(videos).values(video).returning();
}

export async function listVideos(options?: {
	category?: string | null;
	uploadedBy?: string | null;
	compressed?: boolean;
}) {
	const filters = [];

	if (typeof options?.category === 'string') filters.push(eq(videos.category, options.category));
	if (typeof options?.uploadedBy === 'string') filters.push(eq(videos.uploadedBy, options.uploadedBy));
	if (typeof options?.compressed === 'boolean') filters.push(eq(videos.compressed, options.compressed));

	const conditions = filters.length ? and(...filters) : undefined;

	return db.select().from(videos).where(conditions).orderBy(desc(videos.createdAt));
}

export async function getVideoById(id: string) {
	const [row] = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
	return row ?? null;
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
