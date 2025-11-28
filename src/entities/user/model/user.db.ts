import { db, users } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export async function getUserById(id: string) {
	const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return row ?? null;
}

export async function upsertUser(user: NewUser) {
	// naive upsert: try insert, ignore if conflict, then select
	await db.insert(users).values(user).onConflictDoNothing();
	return getUserById(user.id);
}
