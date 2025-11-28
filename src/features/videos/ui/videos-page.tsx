'use client';

import { useState } from 'react';
import { UploadProvider } from '../providers/upload-provider';
import { VideoProvider } from '../providers/video-provider';
import { UploadPanel } from './upload-panel';
import { VideoList } from './video-list';

export function VideosPage() {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	return (
		<VideoProvider>
			<div className="max-w-7xl mx-auto px-6 space-y-6 w-full">
				<h1 className="text-2xl font-semibold">ClipVault Videos</h1>

				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-pressed={viewMode === 'grid'}
						onClick={() => setViewMode('grid')}
						className={`px-3 py-1 rounded-md text-sm transition ${
							viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white border'
						}`}
					>
						Grid
					</button>
					<button
						type="button"
						aria-pressed={viewMode === 'list'}
						onClick={() => setViewMode('list')}
						className={`px-3 py-1 rounded-md text-sm transition ${
							viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white border'
						}`}
					>
						List
					</button>
				</div>
				<UploadProvider>
					<UploadPanel />
				</UploadProvider>
				<VideoList viewMode={viewMode} />
			</div>
		</VideoProvider>
	);
}
