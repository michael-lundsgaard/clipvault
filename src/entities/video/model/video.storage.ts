import { presignGetObject, presignPutObject } from '@/shared/lib/storage/b2-client';

/**
 * Presigns a URL for uploading a video.
 * @param key the object key (filename) in the bucket
 * @param mimeType the MIME type of the video (default 'video/mp4')
 * @param expiresIn expiration time in seconds for the presigned URL (default 15 minutes)
 * @returns a presigned URL for uploading the video
 */
export async function presignVideoUpload(key: string, mimeType = 'video/mp4', expiresIn = 900) {
	return presignPutObject(key, mimeType, expiresIn);
}

/**
 * Presigns a URL for downloading a video.
 * @param key the object key (filename) in the bucket
 * @param expiresIn expiration time in seconds for the presigned URL (default 1 hour)
 * @returns a presigned URL for downloading the video
 */
export async function presignVideoDownload(key: string, expiresIn = 3600) {
	return presignGetObject(key, expiresIn);
}
