'use client'
import { ReactNode } from 'react'

import { TanStackQueryProvider } from './TanStackQueryProvider'

type TProvidersProps = {
	children: ReactNode
}

export function Providers({ children }: TProvidersProps) {
	return <TanStackQueryProvider>{children}</TanStackQueryProvider>
}
