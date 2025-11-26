import { MainLayoutFooter } from '@/shared/ui/main-layout-footer';
import { MainLayoutHeader } from '@/shared/ui/main-layout-header';
import '@/styles/globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
				<MainLayoutHeader />

				<main className="py-10">
					<div className="max-w-7xl mx-auto px-6">{children}</div>
				</main>

				<MainLayoutFooter />
			</body>
		</html>
	);
}
