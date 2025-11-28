'use client';

import { VideoWithRelations } from '@/entities/video/model/video.types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { listVideosAction } from '../model/videos.actions';

type SelectedCategoryId = string | null;

interface VideoContextType {
	videos: VideoWithRelations[];
	videosLoading: boolean;
	videosError: string | null;
	refreshVideos: () => void;

	selectedCategoryId: SelectedCategoryId;
	setSelectedCategoryId: (id: SelectedCategoryId) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function useVideo() {
	const context = useContext(VideoContext);
	if (!context) throw new Error('useVideo must be used within VideoProvider');
	return context;
}

interface VideoProviderProps {
	children: ReactNode;
}

export function VideoProvider({ children }: VideoProviderProps) {
	const [videos, setVideos] = useState<VideoWithRelations[]>([]);
	const [videosLoading, setVideosLoading] = useState(true);
	const [videosError, setVideosError] = useState<string | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<SelectedCategoryId>(null);

	const fetchVideos = useCallback(async (categoryId: SelectedCategoryId) => {
		try {
			setVideosLoading(true);
			setVideosError(null);

			const data = await listVideosAction({ categoryId });
			setVideos(data);
		} catch (err) {
			setVideosError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setVideosLoading(false);
		}
	}, []);

	const refreshVideos = useCallback(() => {
		fetchVideos(selectedCategoryId);
	}, [fetchVideos, selectedCategoryId]);

	useEffect(() => {
		fetchVideos(selectedCategoryId);
	}, [fetchVideos, selectedCategoryId]);

	const value: VideoContextType = {
		videos,
		videosLoading,
		videosError,
		refreshVideos,
		selectedCategoryId,
		setSelectedCategoryId,
	};

	return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}
