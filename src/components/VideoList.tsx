'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type VideoMeta = {
	id: string;
	originalFilename: string;
	storedFilename: string;
	sizeBytes: number;
	durationSeconds?: number;
	uploadedBy?: string;
	category?: string | null;
	createdAt?: string | null;
};

export default function VideoList() {
	const [videos, setVideos] = useState<VideoMeta[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		fetch('/api/videos/list')
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				if (mounted) setVideos(data);
			})
			.catch((err) => {
				if (mounted) setError(err instanceof Error ? err.message : String(err));
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	if (loading) return <div className="p-4">Loading videos…</div>;
	if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
	if (!videos || videos.length === 0) return <div className="p-4">No videos yet.</div>;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{videos.map((v) => (
				<article key={v.id} className="border rounded overflow-hidden bg-white shadow-sm">
					<Link href={`/videos/${v.id}`} className="block">
						<div className="w-full h-40 bg-gray-100 flex items-center justify-center">
							{/* lightweight placeholder thumbnail */}
							<div className="text-gray-400 flex flex-col items-center">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mb-2">
									<path d="M3 22v-20l18 10-18 10z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<div className="text-sm">Preview</div>
							</div>
						</div>

						<div className="p-3">
							<div className="font-medium truncate">{v.originalFilename}</div>
							<div className="text-xs text-gray-500 mt-1">
								{(v.sizeBytes / 1024 / 1024).toFixed(2)} MB • {v.uploadedBy ?? 'unknown'}
								{v.category ? ` • ${v.category}` : ''}
							</div>
						</div>
					</Link>
				</article>
			))}
		</div>
	);
}
