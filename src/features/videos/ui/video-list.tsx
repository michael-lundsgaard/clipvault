'use client';

import { useVideo } from '../providers/video-provider';
import VideoCard from './video-card';
import VideoListRow from './video-list-row';

type ViewMode = 'grid' | 'list';

export function VideoList({ viewMode = 'grid' }: { viewMode?: ViewMode }) {
	const { videos, videosLoading, videosError } = useVideo();

	if (videosLoading) return <div>Loading videos...</div>;
	if (videosError) return <div>Error: {videosError}</div>;
	if (!videos.length) return <div>No videos yet</div>;

	if (viewMode === 'list') {
		// use compact row component (no thumbnail)
		return (
			<div className="space-y-3">
				{videos.map((v) => (
					<VideoListRow key={v.id} video={v} />
				))}
			</div>
		);
	}

	// default: grid cards
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{videos.map((v) => (
				<div key={v.id}>
					<VideoCard video={v} />
				</div>
			))}
		</div>
	);
}
