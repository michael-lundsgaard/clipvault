'use client';

import { memo } from 'react';

interface VideoPlayerProps {
	video: {
		originalFilename: string;
		sizeBytes: number;
		uploadedBy?: string | null;
		category?: string | null;
	};
	url: string;
}

function VideoPlayer({ video, url }: VideoPlayerProps) {
	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">{video.originalFilename}</h1>

			<div className="mb-4">
				<video controls src={url} className="w-full bg-black" />
			</div>

			<div className="text-sm text-gray-600">
				<div>Size: {(video.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
				<div>Uploaded by: {video.uploadedBy ?? 'unknown'}</div>
				<div>Category: {video.category ?? '—'}</div>
			</div>
		</div>
	);
}

export default memo(VideoPlayer);
