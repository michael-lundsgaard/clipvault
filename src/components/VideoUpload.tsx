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

			<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
				<input
					type="text"
					placeholder="Uploaded by"
					value={uploadedBy}
					onChange={(e) => setUploadedBy(e.target.value)}
					className="w-full p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-200"
				/>
				<input
					type="text"
					placeholder="Category (optional)"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="w-full p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-200"
				/>
			</div>

			<div
				className="border-2 border-dashed rounded-lg p-8 text-center mb-4 bg-white hover:border-indigo-200 transition cursor-pointer"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					addFiles(e.dataTransfer.files);
				}}
				onClick={() => document.getElementById('fileInput')?.click()}
			>
				<p className="text-gray-600 mb-3">Drag & drop MP4 files or click to select</p>
				<input
					type="file"
					accept="video/mp4"
					multiple
					className="hidden"
					id="fileInput"
					onChange={(e) => e.target.files && addFiles(e.target.files)}
				/>
				<div className="flex justify-center gap-2">
					<button
						onClick={() => document.getElementById('fileInput')?.click()}
						className="bg-white border px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition"
					>
						Select Files
					</button>
					<button
						onClick={() => uploadAll({ uploadedBy, category })}
						className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
					>
						Upload All
					</button>
				</div>
			</div>

			<div className="space-y-3">
				{uploads.map((u) => (
					<div key={u.id} className="border rounded p-3 bg-white shadow-sm">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<div className="font-medium">{u.file.name}</div>
								<div className="text-sm text-gray-500 mt-1">{(u.file.size / 1024 / 1024).toFixed(2)} MB</div>

								{u.status === 'uploading' && (
									<div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
										<div className="h-full bg-indigo-500 transition-all" style={{ width: `${u.progress ?? 0}%` }} />
									</div>
								)}
							</div>

							<div className="flex flex-col items-end gap-2">
								{u.status === 'pending' && (
									<button
										onClick={() => startUpload(u.id, { uploadedBy, category })}
										className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm"
									>
										Upload
									</button>
								)}
								{u.status === 'uploading' && (
									<div className="text-indigo-600 text-sm">Uploading {u.progress ?? 0}%</div>
								)}
								{u.status === 'completed' && <div className="text-green-600 text-sm">✓ Completed</div>}
								{u.status === 'error' && <div className="text-red-600 text-sm">✗ {u.error}</div>}

								<button onClick={() => remove(u.id)} className="text-xs text-gray-500 hover:text-gray-700">
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
