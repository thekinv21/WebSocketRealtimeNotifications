'use client'
import { ReactNode, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ITanStackQueryProviderProps = {
	children: ReactNode
}

export function TanStackQueryProvider({
	children,
}: ITanStackQueryProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
