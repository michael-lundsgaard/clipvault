'use client';

import type { Category } from '@/entities/category/model/category.db';
import { listCategoryFiltersAction } from '@/features/videos/model/videos.actions';
import { useCallback, useEffect, useState } from 'react';

type CategoryFilterItem = {
	id: string;
	name: string;
	count: number;
};

interface UseCategoryFiltersResult {
	items: CategoryFilterItem[];
	loading: boolean;
	error: string | null;
	reload: () => void;
}

export function useCategoryFilters(): UseCategoryFiltersResult {
	const [items, setItems] = useState<CategoryFilterItem[]>([]);
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

				const { categories, counts } = await listCategoryFiltersAction();

				if (cancelled) return;

				// Build a lookup of categoryId -> count (including null)
				const countMap = new Map<string, number>();
				for (const row of counts as { categoryId: string; count: number }[]) {
					countMap.set(row.categoryId, Number(row.count));
				}

				const result: CategoryFilterItem[] = [];

				// Real categories with at least one video
				for (const c of categories as Category[]) {
					const count = countMap.get(c.id) ?? 0;
					if (!count) continue;
					result.push({
						id: c.id,
						name: c.name,
						count,
					});
				}

				// Sort by name
				const sorted = result.slice().sort((a, b) => {
					return a.name.localeCompare(b.name);
				});

				setItems(sorted);
			} catch (e) {
				if (!cancelled) {
					setError((e as Error).message ?? 'Failed to load category filters');
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

	return { items, loading, error, reload };
}
