import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Feature-Sliced Design (https://fsd.how/ru/docs/reference/layers)
 *
 * A module may import only from layers strictly below its own.
 *
 * Slices of the same layer must not import each other (entities: only via @x).
 *
 * Cross-element imports must go through the public API (index.ts).
 *
 */

const SLICE_PUBLIC_API = 'index.{ts,tsx}'
const SHARED_PUBLIC_API = ['*/index.{ts,tsx}', '*/*/index.{ts,tsx}']

const toSlice = types => ({
	to: {
		element: { types: { anyOf: types }, fileInternalPath: SLICE_PUBLIC_API },
	},
})
const toShared = {
	to: { element: { type: 'shared', fileInternalPath: SHARED_PUBLIC_API } },
}

const fsdConfig = {
	files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
	plugins: { boundaries },
	settings: {
		'boundaries/include': ['app/**/*', 'src/**/*'],
		'boundaries/elements': [
			/**
			 *
			 * Next.js routing layer (root app/): only re-exports from src/pages and
			 * wires src/app
			 */

			{ type: 'router', partialMatch: false, pattern: 'app' },
			{ type: 'app', partialMatch: false, pattern: 'src/app' },
			{
				type: 'pages',
				partialMatch: false,
				pattern: 'src/pages/*',
				capture: ['slice'],
			},
			{
				type: 'widgets',
				partialMatch: false,
				pattern: 'src/widgets/*',
				capture: ['slice'],
			},
			{
				type: 'features',
				partialMatch: false,
				pattern: 'src/features/*',
				capture: ['slice'],
			},
			{
				type: 'entities',
				partialMatch: false,
				pattern: 'src/entities/*',
				capture: ['slice'],
			},
			{ type: 'shared', partialMatch: false, pattern: 'src/shared' },
		],
	},
	rules: {
		/**
		 * Every file under src/ must belong to an FSD layer (no `processes`, no
		 * ad-hoc folders)
		 */

		'boundaries/no-unknown-files': 'error',
		'boundaries/dependencies': [
			'error',
			{
				default: 'disallow',
				message:
					"FSD violation: '{{ from.element.type }}' cannot import this module of '{{ to.element.type }}'. Import only from lower layers, through their public API (index.ts). See https://fsd.how/ru/docs/reference/layers",
				policies: [
					{
						from: { element: { type: 'router' } },
						allow: [
							{
								to: {
									element: {
										type: 'app',
										fileInternalPath: ['index.{ts,tsx}', '*/index.{ts,tsx}'],
									},
								},
							},
							toSlice(['pages']),
							toShared,
						],
					},
					{
						from: { element: { type: 'app' } },
						allow: [
							toSlice(['pages', 'widgets', 'features', 'entities']),
							toShared,
						],
					},
					{
						from: { element: { type: 'pages' } },
						allow: [toSlice(['widgets', 'features', 'entities']), toShared],
					},
					{
						from: { element: { type: 'widgets' } },
						allow: [toSlice(['features', 'entities']), toShared],
					},
					{
						from: { element: { type: 'features' } },
						allow: [toSlice(['entities']), toShared],
					},
					{
						from: { element: { type: 'entities' } },
						allow: [
							toShared,

							/**
							 * Cross-entity imports only via @x: entities/A/@x/B.ts is
							 * consumed by entities/B
							 */
							{
								to: {
									element: {
										type: 'entities',
										fileInternalPath:
											'@x/{{ from.element.captured.slice }}.{ts,tsx}',
									},
								},
							},
						],
					},

					/**
					 * shared: only internal imports and external packages
					 */
				],
			},
		],
	},
}

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	fsdConfig,
	{
		files: ['src/**/index.{ts,tsx}'],
		rules: {
			/**
			 *  FSD public API must be explicit: no `export *`
			 */
			'no-restricted-syntax': [
				'error',
				{
					selector: 'ExportAllDeclaration',
					message:
						'FSD public API: use explicit named re-exports instead of `export *`.',
				},
			],
		},
	},

	/**
	 * Override default ignores of eslint-config-next.
	 */
	globalIgnores([
		/**
		 * Default ignores of eslint-config-next:
		 */
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
])

export default eslintConfig
