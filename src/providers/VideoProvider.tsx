'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface UploadItem {
	id: string;
	file: File;
	status: UploadStatus;
	progress?: number;
	error?: string;
	videoId?: string;
}

export interface VideoMeta {
	id: string;
	originalFilename: string;
	storedFilename: string;
	sizeBytes: number;
	durationSeconds?: number;
	uploadedBy?: string;
	category?: string | null;
	createdAt?: string | null;
}

interface VideoContextType {
	// Videos
	videos: VideoMeta[];
	videosLoading: boolean;
	videosError: string | null;
	refreshVideos: () => void;

	// Uploads
	uploads: UploadItem[];
	addFiles: (files: FileList) => void;
	startUpload: (id: string, metadata?: { uploadedBy?: string; category?: string }) => void;
	uploadAll: (metadata?: { uploadedBy?: string; category?: string }) => void;
	removeUpload: (id: string) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function useVideo() {
	const context = useContext(VideoContext);
	if (!context) {
		throw new Error('useVideo must be used within VideoProvider');
	}
	return context;
}

/** Minimal PUT with progress via XHR */
function putFileWithProgress(url: string, file: File, onProgress?: (p: number) => void) {
	return new Promise<{ ok: boolean; status: number }>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', url, true);
		xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

		xhr.upload.onprogress = (ev) => {
			if (ev.lengthComputable && onProgress) onProgress((ev.loaded / ev.total) * 100);
		};

		xhr.onload = () => {
			const ok = xhr.status >= 200 && xhr.status < 300;
			resolve({ ok, status: xhr.status });
		};

		xhr.onerror = () => reject(new Error('Network error during upload'));
		xhr.send(file);
	});
}

interface VideoProviderProps {
	children: ReactNode;
}

export function VideoProvider({ children }: VideoProviderProps) {
	// Videos state
	const [videos, setVideos] = useState<VideoMeta[]>([]);
	const [videosLoading, setVideosLoading] = useState(true);
	const [videosError, setVideosError] = useState<string | null>(null);

	// Upload state
	const [uploads, setUploads] = useState<UploadItem[]>([]);

	// Fetch videos
	const fetchVideos = useCallback(async () => {
		try {
			setVideosLoading(true);
			setVideosError(null);
			const res = await fetch('/api/videos/list');
			if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);
			const data = await res.json();
			setVideos(data || []);
		} catch (err) {
			setVideosError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setVideosLoading(false);
		}
	}, []);

	const refreshVideos = useCallback(() => {
		fetchVideos();
	}, [fetchVideos]);

	// Load videos on mount
	useEffect(() => {
		fetchVideos();
	}, [fetchVideos]);

	// Upload functions
	const addFiles = useCallback((files: FileList) => {
		const items: UploadItem[] = Array.from(files)
			.filter((f) => f.type === 'video/mp4')
			.map((file) => ({
				id: crypto.randomUUID(),
				file,
				status: 'pending',
				progress: 0,
			}));
		setUploads((prev) => [...prev, ...items]);
	}, []);

	const startUpload = useCallback(
		async (id: string, metadata: { uploadedBy?: string; category?: string } = {}) => {
			setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'uploading', progress: 0 } : u)));
			const item = uploads.find((u) => u.id === id);
			if (!item) {
				setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: 'Item not found' } : u)));
				return;
			}

			try {
				// Step 1: init on server
				const initRes = await fetch('/api/videos/upload', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						filename: item.file.name,
						sizeBytes: item.file.size,
						uploadedBy: metadata.uploadedBy ?? 'anonymous',
						category: metadata.category ?? null,
						durationSeconds: 0,
					}),
				});

				if (!initRes.ok) throw new Error(`Init failed: ${initRes.status}`);
				const { id: videoId, uploadUrl: rawUploadUrl } = await initRes.json();

				const uploadUrl =
					typeof rawUploadUrl === 'string'
						? rawUploadUrl
						: Array.isArray(rawUploadUrl) && rawUploadUrl.length > 0
						? rawUploadUrl[0].url ?? rawUploadUrl[0]
						: rawUploadUrl?.url ?? String(rawUploadUrl);

				if (!uploadUrl) throw new Error('No upload URL returned');

				// Step 2: upload with progress
				const result = await putFileWithProgress(uploadUrl, item.file, (p) =>
					setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: Math.round(p) } : u)))
				);

				if (!result.ok) throw new Error(`Upload failed: ${result.status}`);

				// Mark completed and refresh video list
				setUploads((prev) =>
					prev.map((u) => (u.id === id ? { ...u, status: 'completed', progress: 100, videoId } : u))
				);

				// Refresh video list after successful upload
				refreshVideos();
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: message } : u)));
			}
		},
		[uploads, refreshVideos]
	);

	const uploadAll = useCallback(
		(metadata?: { uploadedBy?: string; category?: string }) => {
			uploads.forEach((u) => {
				if (u.status === 'pending') startUpload(u.id, metadata);
			});
		},
		[uploads, startUpload]
	);

	const removeUpload = useCallback((id: string) => {
		setUploads((prev) => prev.filter((u) => u.id !== id));
	}, []);

	const value: VideoContextType = {
		videos,
		videosLoading,
		videosError,
		refreshVideos,
		uploads,
		addFiles,
		startUpload,
		uploadAll,
		removeUpload,
	};

	return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}
