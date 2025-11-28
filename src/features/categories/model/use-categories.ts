'use client';

import type { Category } from '@/entities/category/model/category.db';
import { useCallback, useEffect, useState } from 'react';
import { createCategoryAction, listCategoriesAction } from './categories.actions';

interface UseCategoriesResult {
	categories: Category[];
	loading: boolean;
	error: string | null;
	reload: () => void;
	createCategory: (name: string) => Promise<Category | null>;
}

export function useCategories(): UseCategoriesResult {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadToken, setReloadToken] = useState(0);

	const reload = useCallback(() => {
		setReloadToken((t) => t + 1);
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				setLoading(true);
				setError(null);
				const data = await listCategoriesAction();
				if (!cancelled) setCategories(data);
			} catch (e) {
				if (!cancelled) {
					setError((e as Error).message ?? 'Failed to load categories');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [reloadToken]);

	const createCategory = useCallback(async (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return null;

		try {
			const created = await createCategoryAction(trimmed);
			// optimistic update
			setCategories((prev) => {
				const idx = prev.findIndex((c) => c.id === created.id);
				if (idx >= 0) return prev;
				return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
			});
			return created;
		} catch (e) {
			// surface error to caller if they want
			throw e;
		}
	}, []);

	return { categories, loading, error, reload, createCategory };
}
