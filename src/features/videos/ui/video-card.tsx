'use client';

import { VideoWithRelations } from '@/entities/video/model/video.types';
import Link from 'next/link';

function formatDuration(s?: number) {
	if (!s || s <= 0) return '0:00';
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }: { video: VideoWithRelations }) {
	return (
		<article className="group rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition">
			<Link href={`/video/${video.id}`} className="block">
				{/* thumbnail wrapper: enforces 16:9 aspect ratio via padding-top */}
				<div className="relative w-full" style={{ paddingTop: '56.25%' }}>
					{/* actual visual area is absolutely positioned to fill the ratio box */}
					<div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-100 flex items-center justify-center">
						{/* placeholder thumbnail */}
						<div className="flex flex-col items-center text-gray-400">
							<div className="text-xs mt-1">Preview</div>
						</div>

						{/* duration badge */}
						<div className="absolute right-2 bottom-2 bg-black/75 text-white text-xs px-2 py-0.5 rounded">
							{formatDuration(video.durationSeconds)}
						</div>

						{/* subtle play overlay on hover */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition">
							<div className="bg-black/30 rounded-full p-3">
								<svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M5 3v18l15-9L5 3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div className="p-3">
					<div className="font-medium text-sm leading-tight truncate">{video.originalFilename}</div>

					<div className="mt-2 flex items-center justify-between text-xs text-gray-500">
						<div className="flex items-center gap-2">
							<span>{(video.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
							<span>•</span>
							<span className="truncate max-w-32">{video.uploader?.displayName ?? 'Anonymous'}</span>
						</div>

						{/* category */}
						<div>
							<span className="ml-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
								{video.category.name}
							</span>
						</div>
					</div>
				</div>
			</Link>
		</article>
	);
}
