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
	if (!videos || videos.length === 0) return <div className="p-4 text-gray-600">No videos yet.</div>;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{videos.map((v) => (
				<article
					key={v.id}
					className="group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
				>
					<Link href={`/videos/${v.id}`} className="block">
						<div className="relative w-full h-44 bg-gradient-to-br from-gray-100 to-white flex items-center justify-center">
							{/* lightweight placeholder thumbnail with subtle overlay */}
							<div className="text-gray-300 flex flex-col items-center">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mb-2">
									<path d="M3 22v-20l18 10-18 10z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<div className="text-sm">Preview</div>
							</div>

							<div className="absolute right-3 bottom-3 bg-black/60 text-white px-2 py-1 text-xs rounded flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M5 3v18l15-9L5 3z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								Play
							</div>
						</div>

						<div className="p-4">
							<div className="font-medium truncate">{v.originalFilename}</div>

							<div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
								<div>{(v.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
								<div>•</div>
								<div>{v.uploadedBy ?? 'unknown'}</div>
							</div>

							<div className="mt-3 flex items-center gap-2">
								{v.category ? (
									<span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{v.category}</span>
								) : (
									<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">uncategorized</span>
								)}
							</div>
						</div>
					</Link>
				</article>
			))}
		</div>
	);
}
