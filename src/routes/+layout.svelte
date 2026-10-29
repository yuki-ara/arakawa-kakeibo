<script lang="ts">
	import { resolve } from '$app/paths';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const links = [
		{ href: '/', label: 'ホーム' },
		{ href: '/new', label: '入力' },
		{ href: '/transactions', label: '一覧' },
		{ href: '/assets', label: '資産' }
	];
	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>荒川家の家計簿</title>
</svelte:head>

{#if page.url.pathname === '/login'}
	{@render children()}
{:else}
	<div class="mx-auto flex min-h-screen max-w-2xl flex-col">
		<header class="flex items-center justify-between px-4 pt-4">
			<span class="font-bold">荒川家の家計簿</span>
			<form method="post" action="/logout" class="flex items-center gap-3 text-sm text-slate-500">
				{#if data.member}<span>{data.member.name}</span>{/if}
				<button class="underline">ログアウト</button>
			</form>
		</header>
		<nav class="sticky top-0 z-10 mt-3 flex border-b border-slate-200 bg-white">
			{#each links as l (l.href)}
				<a
					href={resolve(l.href as '/')}
					class="flex-1 py-3 text-center text-sm {isActive(l.href)
						? 'border-b-2 border-emerald-600 font-bold text-emerald-700'
						: 'text-slate-500'}">{l.label}</a
				>
			{/each}
		</nav>
		<main class="flex-1 p-4">{@render children()}</main>
	</div>
{/if}
