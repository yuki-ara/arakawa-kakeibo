import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$app/env/public';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import type { Database } from '#lib/database.types.js';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	// JWT を検証してユーザーを確定する（getSession は信用しない）
	const { data } = await event.locals.supabase.auth.getClaims();
	event.locals.userId = data?.claims?.sub ?? null;

	if (!event.locals.userId && event.url.pathname !== '/login') {
		redirect(303, '/login');
	}
	if (event.locals.userId && event.url.pathname === '/login') {
		redirect(303, '/');
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};
