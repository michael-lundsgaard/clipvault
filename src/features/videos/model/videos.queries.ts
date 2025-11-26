import { getVideoById } from '@/entities/video/model/video.db';
import { presignVideoDownload } from '@/entities/video/model/video.storage';

export async function getVideoWithStreamUrl(id: string) {
	const video = await getVideoById(id);
	if (!video) return null;

	const url = await presignVideoDownload(video.storedFilename, 3600); // expires in 1 hour
	return { video, url };
}
