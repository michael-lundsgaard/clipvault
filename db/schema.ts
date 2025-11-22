import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const videos = sqliteTable('videos', {
	id: text('id').primaryKey(), // UUID
	originalFilename: text('original_filename').notNull(),
	storedFilename: text('stored_filename').notNull(), // e.g., B2 object key
	sizeBytes: integer('size_bytes').notNull(),
	durationSeconds: integer('duration_seconds').notNull(),
	category: text('category'),
	uploadedBy: text('uploaded_by').notNull(),
	compressed: integer('compressed', { mode: 'boolean' }).notNull().default(false),
	thumbnailUrl: text('thumbnail_url'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
