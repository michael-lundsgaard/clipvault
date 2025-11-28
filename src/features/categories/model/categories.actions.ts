'use server';

import { getCategoryBySlug, insertCategory, listCategories } from '@/entities/category/model/category.db';
import { nanoid } from 'nanoid';

function slugify(name: string) {
	return name
		.toLowerCase()
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');
}

export async function listCategoriesAction() {
	return listCategories();
}

export async function createCategoryAction(name: string) {
	const trimmed = name.trim();
	if (!trimmed) {
		throw new Error('Category name is required');
	}

	const slug = slugify(trimmed);

	// prevent duplicate slugs
	const existing = await getCategoryBySlug(slug);
	if (existing) {
		return existing;
	}

	const id = nanoid(11);

	const [row] = await insertCategory({
		id,
		name: trimmed,
		slug,
	});

	return row;
}
