'use client';

import type { VideoWithRelations } from '@/entities/video/model/video.types';
import Link from 'next/link';

function formatDuration(s?: number) {
	if (!s || s <= 0) return '0:00';
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoListRow({ video }: { video: VideoWithRelations }) {
	return (
		<article className="flex items-center justify-between gap-4 bg-white rounded-md shadow-sm overflow-hidden">
			<Link href={`/video/${video.id}`} className="flex items-center gap-4 flex-1 p-3">
				<div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm shrink-0">
					{(video.uploader?.displayName ?? video.uploadedBy ?? 'U').charAt(0).toUpperCase()}
				</div>

				<div className="min-w-0">
					<div className="font-medium truncate">{video.originalFilename}</div>
					<div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
						<span>{(video.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
						<span>•</span>
						<span>{video.uploader?.displayName ?? 'Anonymous'}</span>
						<span>•</span>
						<span className="ml-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
							{video.category.name}
						</span>
					</div>
				</div>
			</Link>

			<div className="flex items-center gap-3 pr-3">
				<div className="text-xs bg-black/75 text-white px-2 py-0.5 rounded">
					{formatDuration(video.durationSeconds)}
				</div>
				<button aria-label="more" className="text-gray-400 hover:text-gray-600">
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M12 6v.01M12 12v.01M12 18v.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
			</div>
		</article>
	);
}
