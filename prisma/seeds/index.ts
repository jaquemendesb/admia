import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN" },
  })

  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  })

  await prisma.role.upsert({
    where: { name: "READONLY" },
    update: {},
    create: { name: "READONLY" },
  })

  console.log("✅ Roles created")

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in environment"
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash: passwordHash },
    create: {
      name: "Super Admin",
      email,
      password_hash: passwordHash,
      active: true,
    },
  })

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: user.id,
        role_id: superAdminRole.id,
      },
    },
    update: {},
    create: {
      user_id: user.id,
      role_id: superAdminRole.id,
    },
  })

  console.log(`✅ Admin user created: ${email}`)

  // Default retention config keys — used by maintenance purge jobs
  const defaultConfigs = [
    { key: "retention_days_messages", value: "90" },
    { key: "retention_days_audit", value: "365" },
    { key: "retention_days_sync_logs", value: "90" },
  ]

  for (const cfg of defaultConfigs) {
    await prisma.automationConfig.upsert({
      where: { config_key: cfg.key },
      update: {},
      create: {
        config_key: cfg.key,
        config_value: cfg.value,
        value_type: "INTEGER",
      },
    })
  }

  console.log("✅ Default retention configs seeded")
  console.log("✅ Seed completed")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
