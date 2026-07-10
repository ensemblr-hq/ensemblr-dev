import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
	title: 'Ensemblr',
	description:
		'Ensemblr is coming soon. Join the list to get early access when we launch.',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en'>
			<body className='antialiased'>{children}</body>
		</html>
	);
}
