import { currentMember } from '#lib/server/reference.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.userId) return { member: null };
	return { member: await currentMember(locals.supabase, locals.userId) };
};
