'use client';

import { ChangeEvent, useMemo, useRef } from 'react';
import { useVideo } from '../providers/video-provider';

export function UploadPanel() {
	const { uploads, addFiles, uploadAll, removeUpload } = useVideo();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) addFiles(e.target.files);

		// reset input reference so selecting the same file again triggers onChange
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const totalSizeMB = useMemo(() => {
		const bytes = uploads.reduce((acc, u) => acc + (u.file?.size || 0), 0);
		return bytes / (1024 * 1024);
	}, [uploads]);

	return (
		<div className="space-y-3">
			{/* drag & drop / click zone */}
			<div
				className="border-2 border-dashed rounded-lg p-6 text-center bg-white/40 hover:border-indigo-200 transition cursor-pointer"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
				}}
				onClick={() => fileInputRef.current?.click()}
			>
				<p className="text-gray-600 mb-3">Drag & drop MP4 files here or click to select</p>

				<input
					ref={fileInputRef}
					type="file"
					accept="video/mp4"
					multiple
					className="hidden"
					id="fileInput"
					onChange={onFileChange}
				/>

				<div className="flex justify-center gap-2">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							fileInputRef.current?.click();
						}}
						className="bg-white border px-3 py-1 rounded text-gray-700 hover:bg-gray-50 transition text-sm"
					>
						Select files
					</button>

					<button
						type="button"
						className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-sm"
						onClick={(e) => {
							e.stopPropagation();
							uploadAll();
						}}
					>
						Upload all
					</button>
				</div>
			</div>

			{/* Warning banner when 2 or more files are queued */}
			{uploads.length >= 2 && (
				<div
					className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800"
					role="alert"
					aria-live="polite"
				>
					Warning: You are about to upload {uploads.length} files — total size {totalSizeMB.toFixed(2)} MB.
				</div>
			)}

			<div className="space-y-2">
				{uploads.map((u) => (
					<div key={u.id} className="border rounded p-2 flex items-center justify-between">
						<div className="flex-1">
							<div className="text-sm">{u.file.name}</div>
							<div className="text-xs text-gray-500">
								{/* TODO: Create seperate component for upload item details */}
								Size: {(u.file.size / (1024 * 1024)).toFixed(2)} MB &#8226; Status: {u.status}{' '}
								{typeof u.progress === 'number' && `(${u.progress}%)`}
								{u.error && <span className="text-red-500 ml-2">{u.error}</span>}
							</div>
						</div>
						<button
							type="button"
							className="ml-2 text-xs text-gray-600 hover:text-red-600"
							onClick={() => removeUpload(u.id)}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
