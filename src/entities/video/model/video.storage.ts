import { presignGetObject, presignPutObject } from '@/shared/lib/storage/b2-client';

export async function presignVideoUpload(key: string, mimeType = 'video/mp4', expiresIn = 3600) {
	return presignPutObject(key, mimeType, expiresIn);
}

export async function presignVideoDownload(key: string, expiresIn = 3600) {
	return presignGetObject(key, expiresIn);
}
