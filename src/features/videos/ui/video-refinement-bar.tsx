'use client';

import { useCategoryFilters } from '@/features/categories/model/use-category-filters';
import { memo } from 'react';
import { useVideo } from '../providers/video-provider';

export function VideoRefinementBar() {
	const { items, loading, error } = useCategoryFilters();
	const { selectedCategoryId, setSelectedCategoryId } = useVideo();

	const handleSelectAll = () => {
		setSelectedCategoryId(null);
	};

	const handleSelect = (id: string) => {
		setSelectedCategoryId(id);
	};

	const isAllSelected = selectedCategoryId === null;
	const totalCount = items.reduce((sum, item) => sum + item.count, 0);

	// Don't render the bar if there are no videos at all
	if (totalCount === 0) return null;

	return (
		<div className="flex flex-col gap-2 mb-4">
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm font-medium text-muted-foreground">Filter by category</div>
				{loading && <span className="text-xs text-muted-foreground">Loading…</span>}
				{error && <span className="text-xs text-destructive">Failed to load filters</span>}
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{/* "All" button with total count */}
				<button
					type="button"
					onClick={handleSelectAll}
					className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition ${
						isAllSelected
							? 'bg-indigo-600 text-white border-indigo-600'
							: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
					}`}
				>
					<span>All</span>
					<span
						className={`text-[10px] rounded-full px-1.5 py-0.5 ${
							isAllSelected ? 'bg-indigo-500/70 text-white' : 'bg-slate-100 text-slate-600'
						}`}
					>
						{totalCount}
					</span>
				</button>

				{/* category buttons */}
				{items.map((item) => {
					const isActive = selectedCategoryId === item.id;

					return (
						<button
							key={item.id}
							type="button"
							onClick={() => handleSelect(item.id)}
							className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition ${
								isActive
									? 'bg-indigo-600 text-white border-indigo-600'
									: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
							}`}
						>
							<span>{item.name}</span>
							<span
								className={`text-[10px] rounded-full px-1.5 py-0.5 ${
									isActive ? 'bg-indigo-500/70 text-white' : 'bg-slate-100 text-slate-600'
								}`}
							>
								{item.count}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default memo(VideoRefinementBar);
