'use server';

import { getVideoWithStreamUrl } from '@/features/videos/model/videos.queries';
import VideoPlayer from '@/features/videos/ui/video-player';
import { notFound } from 'next/navigation';

interface PageProps {
	params: { id: string } | Promise<{ id: string }>;
}

export default async function VideoPage({ params }: PageProps) {
	const { id } = await params;
	if (!id || typeof id !== 'string') return notFound();

	const data = await getVideoWithStreamUrl(id);
	if (!data) return notFound();

	const { video, url } = data;
	return <VideoPlayer video={video} url={url} />;
}
