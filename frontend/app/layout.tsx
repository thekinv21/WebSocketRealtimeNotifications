import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from '@/app/providers'

import './globals.css'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Real-Time Notifications',
	description:
		'A real-time notification system built with Next.js 16, NestJS 11, and WebSockets.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html lang='en' className={`${inter.variable} h-full antialiased`}>
			<body className='min-h-full flex flex-col'>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
