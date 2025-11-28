import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// USERS

export const users = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(), // external auth user id or nanoid
		email: text('email').notNull(),
		displayName: text('display_name'),
		role: text('role', { enum: ['user', 'admin'] })
			.notNull()
			.default('user'),

		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(strftime('%s','now'))`),
	},
	(t) => [index('users_email_idx').on(t.email)]
);

export const usersRelations = relations(users, ({ many }) => ({
	videos: many(videos),
}));

// CATEGORIES (game titles, e.g., "R.E.P.O", "Phasmophobia")

export const categories = sqliteTable(
	'categories',
	{
		id: text('id').primaryKey(), // can be nanoid or slug
		name: text('name').notNull(), // human-readable (R.E.P.O, Phasmophobia, ...)
		slug: text('slug').notNull(), // URL/lookup safe (repo, phasmophobia, ...)
	},
	(t) => [index('categories_slug_idx').on(t.slug)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	videos: many(videos),
}));

// VIDEOS

export const videos = sqliteTable(
	'videos',
	{
		id: text('id').primaryKey(), // nanoid
		originalFilename: text('original_filename').notNull(),
		storageKey: text('storage_key').notNull(),

		sizeBytes: integer('size_bytes').notNull(),
		durationSeconds: integer('duration_seconds').notNull(),

		// FK to categories.id (game title). Optional.
		categoryId: text('category_id'),

		// FK to users.id (uploader/owner) Optional – until authentication is enforced.
		uploadedBy: text('uploaded_by'),

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
		index('videos_category_idx').on(t.categoryId),
		index('videos_uploaded_by_idx').on(t.uploadedBy),
	]
);

export const videosRelations = relations(videos, ({ one }) => ({
	uploader: one(users, {
		fields: [videos.uploadedBy],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
}));
