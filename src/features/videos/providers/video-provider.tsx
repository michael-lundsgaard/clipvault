'use client';

import { Video } from '@/entities/video/model/video.db';
// import { Video } from '@/entities/video/modal/video.db';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { createVideoInitAction, listVideosAction } from '../model/videos.actions';
// import { createVideoInitAction, listVideosAction } from '../models/videos.actions';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface UploadItem {
	id: string;
	file: File;
	status: UploadStatus;
	progress?: number;
	error?: string;
	videoId?: string;
}

interface VideoContextType {
	videos: Video[];
	videosLoading: boolean;
	videosError: string | null;
	refreshVideos: () => void;

	uploads: UploadItem[];
	addFiles: (files: FileList) => void;
	startUpload: (id: string, metadata?: { uploadedBy?: string; category?: string }) => void;
	uploadAll: (metadata?: { uploadedBy?: string; category?: string }) => void;
	removeUpload: (id: string) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function useVideo() {
	const context = useContext(VideoContext);
	if (!context) throw new Error('useVideo must be used within VideoProvider');
	return context;
}

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
	const [videos, setVideos] = useState<Video[]>([]);
	const [videosLoading, setVideosLoading] = useState(true);
	const [videosError, setVideosError] = useState<string | null>(null);
	const [uploads, setUploads] = useState<UploadItem[]>([]);

	const fetchVideos = useCallback(async () => {
		try {
			setVideosLoading(true);
			setVideosError(null);
			const data = await listVideosAction();
			setVideos(data);
		} catch (err) {
			setVideosError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setVideosLoading(false);
		}
	}, []);

	const refreshVideos = useCallback(() => {
		fetchVideos();
	}, [fetchVideos]);

	useEffect(() => {
		fetchVideos();
	}, [fetchVideos]);

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
				const initRes = await createVideoInitAction({
					filename: item.file.name,
					sizeBytes: item.file.size,
					uploadedBy: metadata.uploadedBy ?? 'anonymous',
					category: metadata.category,
				});

				const uploadUrl = initRes.uploadUrl;
				if (!uploadUrl) throw new Error('No upload URL returned');

				const result = await putFileWithProgress(uploadUrl, item.file, (p) =>
					setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: Math.round(p) } : u)))
				);

				if (!result.ok) throw new Error(`Upload failed: ${result.status}`);

				setUploads((prev) =>
					prev.map((u) => (u.id === id ? { ...u, status: 'completed', progress: 100, videoId: initRes.id } : u))
				);

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
