'use client';

import useVideoUploader from '@/hooks/useVideoUploader';
import { memo, useState } from 'react';

function VideoUpload() {
	const { uploads, addFiles, startUpload, uploadAll, remove } = useVideoUploader();
	const [uploadedBy, setUploadedBy] = useState('anonymous');
	const [category, setCategory] = useState('');

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Upload Videos</h2>

			<div className="mb-4 space-y-2">
				<input
					type="text"
					value={uploadedBy}
					onChange={(e) => setUploadedBy(e.target.value)}
					className="w-full p-2 border rounded"
				/>
				<input
					type="text"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="w-full p-2 border rounded"
				/>
			</div>

			<div
				className="border-2 border-dashed rounded-lg p-8 text-center mb-4"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					addFiles(e.dataTransfer.files);
				}}
			>
				<p>Drag & drop MP4 files or click to select</p>
				<input
					type="file"
					accept="video/mp4"
					multiple
					className="hidden"
					id="fileInput"
					onChange={(e) => e.target.files && addFiles(e.target.files)}
				/>
				<button
					onClick={() => document.getElementById('fileInput')?.click()}
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Select Files
				</button>
				<button
					onClick={() => uploadAll({ uploadedBy, category })}
					className="ml-2 bg-green-500 text-white px-4 py-2 rounded"
				>
					Upload All
				</button>
			</div>

			<div className="space-y-2">
				{uploads.map((u) => (
					<div key={u.id} className="border rounded p-3 bg-gray-50">
						<div className="flex justify-between">
							<div>
								<div className="font-medium">{u.file.name}</div>
								<div className="text-sm text-gray-500">{(u.file.size / 1024 / 1024).toFixed(2)} MB</div>
							</div>
							<div>
								{u.status === 'pending' && (
									<button
										onClick={() => startUpload(u.id, { uploadedBy, category })}
										className="bg-green-500 text-white px-3 py-1 rounded"
									>
										Upload
									</button>
								)}
								{u.status === 'uploading' && <div className="text-blue-600">Uploading... {u.progress ?? 0}%</div>}
								{u.status === 'completed' && <div className="text-green-600">✓ Completed</div>}
								{u.status === 'error' && <div className="text-red-600">✗ {u.error}</div>}
								<button onClick={() => remove(u.id)} className="ml-2 text-sm text-gray-600">
									Remove
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default memo(VideoUpload);
