import prisma from "../config/prisma";
import { runConcurrencyTest } from "./concurrency.test";

async function main() {
  console.log("=== Running Automated Test Suite ===\n");

  const resource = await prisma.resource.findFirst();
  const user = await prisma.user.findFirst();

  if (!resource || !user) {
    console.error("Test Error: No resource or user found in DB. Please run 'yarn db:seed' first.");
    process.exit(1);
  }

  // Generate a future date (1 to 30 days ahead) at an exact hour boundary (e.g., 09:00 - 10:00, 10:00 - 11:00)
  const daysAhead = Math.floor(Math.random() * 30) + 1;
  const startHour = 9 + Math.floor(Math.random() * 7); // Random hour between 9 AM and 3 PM (09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00)

  const start = new Date();
  start.setDate(start.getDate() + daysAhead);
  start.setUTCHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setUTCHours(startHour + 1, 0, 0, 0);

  const startTimeIso = start.toISOString();
  const endTimeIso = end.toISOString();

  const success = await runConcurrencyTest(
    resource.id,
    user.id,
    startTimeIso,
    endTimeIso
  );

  if (!success) {
    console.error("Automated Test Suite Failed!");
    process.exit(1);
  }

  console.log("Automated Test Suite Execution Completed Successfully!");
}

main()
  .catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
