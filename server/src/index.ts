import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import {
  createComplaintInputSchema,
  updateComplaintStatusInputSchema,
  getComplaintsByEmailInputSchema,
  getComplaintByIdInputSchema
} from './schema';

// Import handlers
import { createComplaint } from './handlers/create_complaint';
import { getAllComplaints } from './handlers/get_all_complaints';
import { getComplaintsByEmail } from './handlers/get_complaints_by_email';
import { getComplaintById } from './handlers/get_complaint_by_id';
import { updateComplaintStatus } from './handlers/update_complaint_status';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Customer endpoints - for submitting and viewing complaints
  createComplaint: publicProcedure
    .input(createComplaintInputSchema)
    .mutation(({ input }) => createComplaint(input)),

  getComplaintsByEmail: publicProcedure
    .input(getComplaintsByEmailInputSchema)
    .query(({ input }) => getComplaintsByEmail(input)),

  getComplaintById: publicProcedure
    .input(getComplaintByIdInputSchema)
    .query(({ input }) => getComplaintById(input)),

  // Admin endpoints - for managing all complaints
  getAllComplaints: publicProcedure
    .query(() => getAllComplaints()),

  updateComplaintStatus: publicProcedure
    .input(updateComplaintStatusInputSchema)
    .mutation(({ input }) => updateComplaintStatus(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();