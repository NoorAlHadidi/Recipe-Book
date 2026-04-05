import { databaseClient } from "@/database";
import { seedSuperAdmin, clearSuperAdmin } from "@/seeders";

async function seed() {
  try {
    await databaseClient.connect();
    console.log("Connected to the database.");
    await clearSuperAdmin();
    await seedSuperAdmin();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await databaseClient.disconnect();
    console.log("Disconnected from the database.");
  }
}

seed();