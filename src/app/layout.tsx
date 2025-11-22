import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ClipVault',
	description: '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 text-gray-900">
				<header className="border-b bg-white shadow-sm">
					<div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
						<h1 className="text-lg font-semibold">ClipVault</h1>
						<nav className="space-x-4">
							<a href="/" className="text-sm">
								Gallery
							</a>
							<a href="/upload" className="text-sm">
								Upload
							</a>
						</nav>
					</div>
				</header>
				<main className="py-8">{children}</main>
			</body>
		</html>
	);
}
