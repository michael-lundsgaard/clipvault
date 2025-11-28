import { users } from '@/shared/lib/db';

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
