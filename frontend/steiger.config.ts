import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		// A slice used in only one place should be merged into its consumer,
		// but this must not block work on a slice that is not wired up yet
		rules: { 'fsd/insignificant-slice': 'warn' },
	},
	{
		// Next.js providers wrapper is the app entrypoint, not a generic folder
		files: ['./src/app/providers/**'],
		rules: { 'fsd/segments-by-purpose': 'off' },
	},
])
