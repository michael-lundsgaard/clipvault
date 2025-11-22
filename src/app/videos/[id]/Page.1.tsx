'use server';
import VideoPlayer from '@/components/VideoPlayer';
import { presignGetObject } from '@/lib/storage/b2-client';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { videos } from '../../../../db/schema';
import { Props } from './page';

export default async function Page({ params }: Props) {
	const { id } = await params;

	// Server-side fetch from DB
	const video = await db.select().from(videos).where(eq(videos.id, id)).get();

	if (!video) {
		return (
			<div className="p-6">
				<h1 className="text-xl font-bold">Video not found</h1>
				<p>The requested video does not exist.</p>
			</div>
		);
	}

	// Server-side presigned URL
	const url = await presignGetObject(video.storedFilename, 60 * 30); // 30 min

	// Render Client Component for interactive video UI
	return <VideoPlayer video={video} url={url} />;
}
