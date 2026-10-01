import { runSeed } from "../src/lib/seed-core";

async function main() {
  console.log("🌱 Seeding database...");
  const { steps } = await runSeed();
  console.log("✅ Seed complete!", steps.length > 0 ? `(new: ${steps.join(", ")})` : "(sab already seeded tha)");
  console.log("   👑 Super Admin : superadmin@visionpublicschool.edu / Super@123");
  console.log("   🛡️  Admin       : admin@visionpublicschool.edu / Admin@123");
  console.log("   🎓 Student     : student@visionpublicschool.edu / Student@123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
