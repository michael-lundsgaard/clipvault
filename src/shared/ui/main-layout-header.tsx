import Link from 'next/link';

export function MainLayoutHeader() {
	return (
		<header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-sm">
			<div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-3">
					<svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M3 22v-20l18 10-18 10z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<span className="text-lg font-semibold tracking-tight">ClipVault</span>
				</Link>

				<nav className="flex items-center gap-4">
					<Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
						Gallery
					</Link>
					<Link
						href="/upload"
						className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100 transition"
					>
						Upload
					</Link>
				</nav>
			</div>
		</header>
	);
}
