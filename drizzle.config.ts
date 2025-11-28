import * as dotenv from 'dotenv';
dotenv.config();

import { Config } from 'drizzle-kit';

export default {
	schema: './src/shared/lib/db/schema.ts',
	out: './db-migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_DB_URL!,
		authToken: process.env.TURSO_DB_TOKEN,
	},
} satisfies Config;
