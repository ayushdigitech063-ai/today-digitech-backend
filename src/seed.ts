import { runAdminBootstrap } from './scripts/runAdminBootstrap';

void runAdminBootstrap().catch((error: unknown) => {
  console.error('Administrator bootstrap failed:', error);
  process.exitCode = 1;
});
