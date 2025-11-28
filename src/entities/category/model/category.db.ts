import { categories, db } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export async function insertCategory(category: NewCategory) {
	return db.insert(categories).values(category).returning();
}

export async function listCategories() {
	return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: string) {
	const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
	return row ?? null;
}

export async function getCategoryBySlug(slug: string) {
	const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
	return row ?? null;
}
