import { NextResponse } from 'next/server';
import { listVideos } from '../../../../../db/queries';

export async function GET() {
	const videos = await listVideos();
	return NextResponse.json(videos);
}
