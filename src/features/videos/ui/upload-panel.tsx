'use client';

import { useCategories } from '@/features/categories/model/use-categories';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useVideo } from '../providers/video-provider';

export function UploadPanel() {
	const { uploads, addFiles, uploadAll, removeUpload } = useVideo();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { categories } = useCategories();

	const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
	const [categorySearch, setCategorySearch] = useState('');
	const [categoryOpen, setCategoryOpen] = useState(false);
	const categoryWrapperRef = useRef<HTMLDivElement | null>(null);

	// close dropdown when clicking outside
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (!categoryWrapperRef.current) return;
			if (!categoryWrapperRef.current.contains(e.target as Node)) {
				setCategoryOpen(false);
			}
		}
		if (categoryOpen) {
			document.addEventListener('mousedown', onClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', onClickOutside);
		};
	}, [categoryOpen]);

	const filteredCategories = useMemo(() => {
		const q = categorySearch.toLowerCase().trim();
		if (!q) return categories;
		return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
	}, [categories, categorySearch]);

	const selectedCategory = useMemo(
		() => categories.find((c) => c.id === selectedCategoryId),
		[categories, selectedCategoryId]
	);

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) addFiles(e.target.files);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const totalSizeMB = useMemo(() => {
		const bytes = uploads.reduce((acc, u) => acc + (u.file?.size || 0), 0);
		return bytes / (1024 * 1024);
	}, [uploads]);

	return (
		<div className="space-y-3">
			{/* drag & drop / click zone */}
			<div
				className="border-2 border-dashed rounded-lg p-6 text-center bg-white/40 hover:border-indigo-200 transition cursor-pointer"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
				}}
				onClick={() => fileInputRef.current?.click()}
			>
				<p className="text-gray-600 mb-3">Drag & drop MP4 files here or click to select</p>

				<input
					ref={fileInputRef}
					type="file"
					accept="video/mp4"
					multiple
					className="hidden"
					id="fileInput"
					onChange={onFileChange}
				/>

				<div className="flex justify-center gap-2">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							fileInputRef.current?.click();
						}}
						className="bg-white border px-3 py-1 rounded text-gray-700 hover:bg-gray-50 transition text-sm"
					>
						Select files
					</button>

					<button
						type="button"
						className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-sm"
						onClick={(e) => {
							e.stopPropagation();
							uploadAll({ categoryId: selectedCategoryId });
						}}
					>
						Upload all
					</button>
				</div>
			</div>

			{/* category selector (searchable dropdown) */}
			<div className="flex items-start gap-3">
				<label className="mt-2 text-sm text-gray-600 shrink-0">Category</label>

				<div ref={categoryWrapperRef} className="relative flex-1">
					<button
						type="button"
						onClick={() => setCategoryOpen((o) => !o)}
						className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-white"
					>
						<span className={selectedCategory ? '' : 'text-gray-400'}>
							{selectedCategory ? selectedCategory.name : 'Uncategorized'}
						</span>
						<svg
							className={`w-4 h-4 text-gray-500 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
						>
							<path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>

					{categoryOpen && (
						<div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
							<div className="p-2 border-b">
								<input
									type="text"
									autoFocus
									className="w-full border rounded px-2 py-1 text-sm"
									placeholder="Search games..."
									value={categorySearch}
									onChange={(e) => setCategorySearch(e.target.value)}
								/>
							</div>

							<ul className="text-sm">
								<li>
									<button
										type="button"
										className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
											!selectedCategoryId ? 'bg-gray-50 font-medium' : ''
										}`}
										onClick={() => {
											setSelectedCategoryId(undefined);
											setCategoryOpen(false);
										}}
									>
										Uncategorized
									</button>
								</li>

								{filteredCategories.length === 0 ? (
									<li className="px-3 py-2 text-xs text-gray-500">No matches</li>
								) : (
									filteredCategories.map((c) => (
										<li key={c.id}>
											<button
												type="button"
												className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
													selectedCategoryId === c.id ? 'bg-indigo-50 font-medium' : ''
												}`}
												onClick={() => {
													setSelectedCategoryId(c.id);
													setCategoryOpen(false);
												}}
											>
												<div>{c.name}</div>
												<div className="text-[11px] text-gray-500">{c.slug}</div>
											</button>
										</li>
									))
								)}
							</ul>
						</div>
					)}
				</div>

				<div className="mt-2 text-sm text-gray-500 shrink-0">Total: {totalSizeMB.toFixed(2)} MB</div>
			</div>

			{/* Warning banner when 2 or more files are queued */}
			{uploads.length >= 2 && (
				<div
					className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800"
					role="alert"
					aria-live="polite"
				>
					Warning: You are about to upload {uploads.length} files — total size {totalSizeMB.toFixed(2)} MB.
				</div>
			)}

			<div className="space-y-2">
				{uploads.map((u) => (
					<div key={u.id} className="border rounded p-2 flex items-center justify-between">
						<div className="flex-1">
							<div className="text-sm">{u.file.name}</div>
							<div className="text-xs text-gray-500">
								Size: {(u.file.size / (1024 * 1024)).toFixed(2)} MB &#8226; Status: {u.status}{' '}
								{typeof u.progress === 'number' && `(${u.progress}%)`}
								{u.error && <span className="text-red-500 ml-2">{u.error}</span>}
							</div>
						</div>
						<button
							type="button"
							className="ml-2 text-xs text-gray-600 hover:text-red-600"
							onClick={() => removeUpload(u.id)}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
