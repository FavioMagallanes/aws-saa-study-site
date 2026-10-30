import { createServerlessApp } from '../apps/api/src/serverless-app.ts';

// Built once when Vercel loads the function, then reused by every request the instance serves.
const app = createServerlessApp();

// Vercel requires the request handler as the module's default export.
export { app as default };
