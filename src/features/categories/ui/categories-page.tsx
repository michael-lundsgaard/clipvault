'use client';

import { useCategories } from '@/features/categories/model/use-categories';
import { FormEvent, useState } from 'react';

export function CategoriesPage() {
	const { categories, loading, error, createCategory } = useCategories();
	const [categoryName, setCategoryName] = useState('');
	const [creating, setCreating] = useState(false);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		if (!categoryName.trim()) return;

		try {
			setCreating(true);
			await createCategory(categoryName);
			setCategoryName('');
		} catch (e) {
			alert((e as Error).message ?? 'Failed to create category');
		} finally {
			setCreating(false);
		}
	}

	if (loading) return <div className="p-4">Loading categories...</div>;
	if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

	return (
		<div className="max-w-xl mx-auto px-4 py-6 space-y-6">
			<h1 className="text-2xl font-semibold">Game Categories</h1>

			<form onSubmit={onSubmit} className="flex gap-2 items-center">
				<input
					type="text"
					value={categoryName}
					onChange={(e) => setCategoryName(e.target.value)}
					placeholder="New game title (e.g., Phasmophobia)"
					className="flex-1 border rounded-md px-3 py-2 text-sm"
				/>
				<button
					type="submit"
					disabled={creating || !categoryName.trim()}
					className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white disabled:opacity-60"
				>
					{creating ? 'Adding…' : 'Add'}
				</button>
			</form>

			<div className="bg-white rounded-md shadow-sm divide-y">
				{categories.length === 0 ? (
					<div className="p-4 text-sm text-gray-500">No categories yet. Add your first game above.</div>
				) : (
					categories.map((c) => (
						<div key={c.id} className="p-3 flex items-center justify-between text-sm">
							<div>
								<div className="font-medium">{c.name}</div>
								<div className="text-xs text-gray-500">{c.slug}</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
