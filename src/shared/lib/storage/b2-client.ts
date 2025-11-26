import {
	CompleteMultipartUploadCommand,
	CreateMultipartUploadCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
	UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
	region: process.env.B2_REGION,
	endpoint: process.env.B2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.B2_KEY_ID!,
		secretAccessKey: process.env.B2_APP_KEY!,
	},
});

/**
 * Presigns a URL for uploading an object to B2.
 * @param key the object key (filename) in the bucket
 * @param mimeType the MIME type of the object being uploaded
 * @param expiresIn expiration time in seconds for the presigned URL
 * @returns a presigned URL for uploading the object
 */
export async function presignPutObject(key: string, mimeType: string, expiresIn = 3600) {
	const cmd = new PutObjectCommand({
		Bucket: process.env.B2_BUCKET,
		Key: key,
		ContentType: mimeType,
	});
	return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Presigns a URL for downloading an object from B2.
 * @param key the object key (filename) in the bucket
 * @param expiresIn expiration time in seconds for the presigned URL
 * @returns a presigned URL for downloading the object
 */
export async function presignGetObject(key: string, expiresIn = 3600) {
	const cmd = new GetObjectCommand({
		Bucket: process.env.B2_BUCKET,
		Key: key,
	});
	return getSignedUrl(client, cmd, { expiresIn });
}

// This implementation currently uses only single-part (PUT) uploads.
// Multipart upload functions are in place but not yet enabled.
// Backblaze guidance: use multipart for files > ~100 MB for better
// reliability and performance. Multipart becomes mandatory for files > 5 GB.

/**
 * Initializes a multipart upload session.
 * @param key the object key (filename) in the bucket
 * @param mimeType the MIME type of the object being uploaded
 * @returns the UploadId for the multipart upload session
 */
export async function initMultipart(key: string, mimeType: string) {
	const cmd = new CreateMultipartUploadCommand({
		Bucket: process.env.B2_BUCKET,
		Key: key,
		ContentType: mimeType,
	});
	const res = await client.send(cmd);
	return res.UploadId;
}

/**
 * Presigns a URL for uploading a specific part of a multipart upload.
 * @param key the object key (filename) in the bucket
 * @param uploadId the UploadId of the multipart upload session
 * @param partNumber the part number to be uploaded
 * @param expiresIn expiration time in seconds for the presigned URL
 * @returns a presigned URL for uploading the specified part
 */
export async function presignPartUrl(key: string, uploadId: string, partNumber: number, expiresIn = 3600) {
	const cmd = new UploadPartCommand({
		Bucket: process.env.B2_BUCKET,
		Key: key,
		PartNumber: partNumber,
		UploadId: uploadId,
	});
	return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Completes a multipart upload by assembling all uploaded parts.
 * @param key the object key (filename) in the bucket
 * @param uploadId the UploadId of the multipart upload session
 * @param parts array of parts with their ETag and PartNumber
 * @returns the result of the complete multipart upload operation
 */
export async function completeMultipart(
	key: string,
	uploadId: string,
	parts: Array<{ ETag: string; PartNumber: number }>
) {
	const cmd = new CompleteMultipartUploadCommand({
		Bucket: process.env.B2_BUCKET,
		Key: key,
		UploadId: uploadId,
		MultipartUpload: { Parts: parts },
	});
	return client.send(cmd);
}
