import { defineEnvVars } from '@sveltejs/kit/env';

const required = (value: string | undefined) => {
	if (!value) throw new Error('環境変数が未設定です（.env.example を参照）');
	return value;
};

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: { public: true, schema: required },
	PUBLIC_SUPABASE_KEY: { public: true, schema: required }
});
