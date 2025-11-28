'use client';

import { nanoid } from 'nanoid';
import { createContext, useCallback, useContext, useState } from 'react';
import { confirmUploadAction, createVideoInitAction } from '../model/videos.actions';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface UploadItem {
	id: string;
	file: File;
	status: UploadStatus;
	progress?: number;
	error?: string;
}

interface VideoMetadata {
	uploadedBy?: string;
	categoryId?: string;
}

interface UploadContextType {
	uploads: UploadItem[];
	addFiles: (files: FileList) => void;
	startUpload: (id: string, metadata?: VideoMetadata) => void;
	uploadAll: (metadata?: VideoMetadata) => void;
	removeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export function useUpload() {
	const context = useContext(UploadContext);
	if (!context) throw new Error('useUpload must be used within UploadProvider');
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

export function UploadProvider({ children }: { children: React.ReactNode }) {
	const [uploads, setUploads] = useState<UploadItem[]>([]);
	// const { refreshVideos } = useVideo();

	const addFiles = useCallback((files: FileList) => {
		const items: UploadItem[] = Array.from(files)
			.filter((f) => f.type === 'video/mp4')
			.map((file) => ({
				id: nanoid(11),
				file,
				status: 'pending',
				progress: 0,
			}));
		setUploads((prev) => [...prev, ...items]);
	}, []);

	const startUpload = useCallback(
		async (id: string, metadata: VideoMetadata = {}) => {
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
					categoryId: metadata.categoryId,
				});

				const uploadUrl = initRes.uploadUrl;
				if (!uploadUrl) throw new Error('No upload URL returned');

				const result = await putFileWithProgress(uploadUrl, item.file, (p) =>
					setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: Math.round(p) } : u)))
				);

				if (!result.ok) throw new Error(`Upload failed: ${result.status}`);

				await confirmUploadAction(initRes.id);

				setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'completed', progress: 100 } : u)));

				// refreshVideos();
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: message } : u)));
			}
		},
		[uploads]
	);

	const uploadAll = useCallback(
		(metadata?: VideoMetadata) => {
			uploads.forEach((u) => {
				if (u.status === 'pending') startUpload(u.id, metadata);
			});
		},
		[uploads, startUpload]
	);

	const removeUpload = useCallback((id: string) => {
		setUploads((prev) => prev.filter((u) => u.id !== id));
	}, []);

	const value: UploadContextType = {
		uploads,
		addFiles,
		startUpload,
		uploadAll,
		removeUpload,
	};

	return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}
