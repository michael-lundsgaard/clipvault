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
			<div className="bg-white border rounded-lg shadow-sm overflow-hidden">
				<div className="px-6 py-5 border-b">
					<h1 className="text-xl font-semibold">{video.originalFilename}</h1>
					<div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
						<div>Size: {(video.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
						{video.category && (
							<div className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">{video.category}</div>
						)}
						<div className="ml-auto text-xs text-gray-400">Stream</div>
					</div>
				</div>

				<div className="p-6 bg-gray-900 flex justify-center">
					<video controls src={url} className="w-full max-h-[60vh] bg-black rounded-md" />
				</div>

				<div className="px-6 py-4 text-sm text-gray-600 flex items-center gap-4">
					<div>
						Uploaded by: <span className="text-gray-800">{video.uploadedBy ?? 'unknown'}</span>
					</div>
					<div className="ml-auto text-xs text-gray-400">Enjoy your clip</div>
				</div>
			</div>
		</div>
	);
}

export default memo(VideoPlayer);
