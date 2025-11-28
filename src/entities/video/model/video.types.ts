import { categories, users, videos } from '@/shared/lib/db';

export type VideoRow = typeof videos.$inferSelect;
export type NewVideoRow = typeof videos.$inferInsert;

export type UserRow = typeof users.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

export interface VideoWithRelations extends VideoRow {
	uploader: UserRow;
	category: CategoryRow;
}
