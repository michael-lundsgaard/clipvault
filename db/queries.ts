import { desc, eq } from 'drizzle-orm';
import { db } from './index';
import { videos } from './schema';

// export type FetchVideosOptions = {
// 	sortBy?: 'createdAt' | 'sizeBytes' | 'durationSeconds' | 'originalFilename' | 'uploadedBy';
// 	order?: 'asc' | 'desc';
// 	limit?: number;
// 	offset?: number;
// 	category?: string;
// 	uploadedBy?: string;
// 	compressed?: boolean;
// };

// export async function fetchVideos(opts: FetchVideosOptions = {}) {
// 	const { sortBy = 'createdAt', order = 'desc', limit = 10, offset = 0, category, uploadedBy, compressed } = opts;

// 	const sortColumnMap = {
// 		createdAt: videos.createdAt,
// 		sizeBytes: videos.sizeBytes,
// 		durationSeconds: videos.durationSeconds,
// 		originalFilename: videos.originalFilename,
// 		uploadedBy: videos.uploadedBy,
// 	};

// 	const filters = [];
// 	if (typeof category === 'string') filters.push(eq(videos.category, category));
// 	if (typeof uploadedBy === 'string') filters.push(eq(videos.uploadedBy, uploadedBy));
// 	if (typeof compressed === 'boolean') filters.push(eq(videos.compressed, compressed));

// 	const orderFn = order === 'asc' ? asc : desc;
// 	const sortColumn = sortColumnMap[sortBy];

// 	const query = db
// 		.select()
// 		.from(videos)
// 		.where(filters.length ? and(...filters) : undefined)
// 		.orderBy(orderFn(sortColumn))
// 		.limit(limit ?? undefined)
// 		.offset(offset ?? undefined);

// 	return query.all();
// }

export async function insertVideo(meta: typeof videos.$inferInsert) {
	return db.insert(videos).values(meta).run();
}

export async function listVideos() {
	return db.select().from(videos).orderBy(desc(videos.createdAt));
}

export async function getVideo(id: string) {
	return db.select().from(videos).where(eq(videos.id, id)).get();
}

export async function updateThumbnail(id: string, thumbnailUrl: string) {
	return db.update(videos).set({ thumbnailUrl }).where(eq(videos.id, id)).run();
}
