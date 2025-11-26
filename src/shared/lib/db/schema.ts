import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const videos = sqliteTable(
	'videos',
	{
		id: text('id').primaryKey(), // UUID

		originalFilename: text('original_filename').notNull(),
		storedFilename: text('stored_filename').notNull(),

		sizeBytes: integer('size_bytes').notNull(),
		durationSeconds: integer('duration_seconds').notNull(),

		category: text('category'),

		uploadedBy: text('uploaded_by').notNull().default('anonymous'),

		compressed: integer('compressed', { mode: 'boolean' }).notNull().default(false),

		thumbnailUrl: text('thumbnail_url'),

		status: text('status', {
			enum: ['pending', 'processing', 'ready', 'failed'],
		})
			.notNull()
			.default('pending'),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(strftime('%s','now'))`),

		completedAt: integer('completed_at', { mode: 'timestamp' }),
	},

	(t) => [
		index('videos_status_idx').on(t.status),
		index('videos_category_idx').on(t.category),
		index('videos_uploaded_by_idx').on(t.uploadedBy),

		// You probably don’t need unique constraints here,
		// but this is how you'd declare them if you did:
		// unique("videos_stored_filename_unique").on(t.storedFilename),
	]
);
