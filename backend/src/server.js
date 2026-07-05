import app from './app.js';
import { env } from './config/env.js';
import { sweepAbandonedCarts } from './services/cartSweep.service.js';
import { maybeSendMonthlyReports } from './services/monthlyReport.service.js';

app.listen(env.port, () => {
  console.log(`Blorbify backend listening on http://localhost:${env.port}`);
});

// This backend runs as a plain long-running process (not serverless), so an
// in-process interval stands in for a cron job — no external scheduler needed.
// The tradeoff: the timer resets on every restart/deploy, which is fine for a
// nudge email that isn't time-critical.
setInterval(() => {
  sweepAbandonedCarts().catch((error) => {
    console.error('Abandoned cart sweep failed:', error.message);
  });
}, 30 * 60 * 1000);

// Daily rather than monthly: maybeSendMonthlyReports() targets the *previous*
// completed month and is idempotency-guarded (monthlyReportRuns/{monthKey}), so
// checking daily is a no-op except on the first tick after a month rolls over —
// and it self-heals if the process was down when the month actually turned over.
setInterval(() => {
  maybeSendMonthlyReports().catch((error) => {
    console.error('Monthly report job failed:', error.message);
  });
}, 24 * 60 * 60 * 1000);
