import { Role } from "@prisma/client";
import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Starting Database Seed...");

  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminName = process.env.ADMIN_NAME || "";

  // Check if SuperAdmin user already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: Role.SUPERADMIN },
      ],
    },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const superAdmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.SUPERADMIN,
      },
    });
    console.log(`Created SuperAdmin user: ${superAdmin.email} (${superAdmin.id})`);
  } else {
    console.log(`SuperAdmin user already exists (${existingSuperAdmin.email}), skipping creation.`);
  }

  // Seed Resources & Availabilities
  const resourcesToSeed = [
    {
      name: "Conference Room London",
      timezone: "Europe/London",
      availabilities: [
        // Monday (1) to Friday (5), 09:00 - 17:00
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
      ],
    },
    {
      name: "Executive Boardroom NY",
      timezone: "America/New_York",
      availabilities: [
        // Monday (1) to Friday (5), 09:00 - 17:00
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
      ],
    },
    {
      name: "Consultant Desk Tokyo",
      timezone: "Asia/Tokyo",
      availabilities: [
        // Monday (1) to Saturday (6), 10:00 - 18:00
        { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 6, startTime: "10:00", endTime: "18:00" },
      ],
    },
  ];

  for (const r of resourcesToSeed) {
    const existing = await prisma.resource.findFirst({
      where: { name: r.name },
    });

    if (!existing) {
      const createdResource = await prisma.resource.create({
        data: {
          name: r.name,
          timezone: r.timezone,
          availabilities: {
            create: r.availabilities,
          },
        },
      });
      console.log(`Seeded Resource: ${createdResource.name} (${createdResource.timezone})`);
    } else {
      console.log(`Resource '${r.name}' already exists, skipping.`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
