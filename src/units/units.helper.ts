import { databaseClient, unitsTable } from "@/database";
import { AppError } from "@/errors";
import { eq } from "drizzle-orm";

export async function checkUnitExists(unitId: number) {
  const existingUnit = await databaseClient.db
    .select()
    .from(unitsTable)
    .where(eq(unitsTable.unitId, unitId))
    .execute();
  if (existingUnit.length === 0) {
    throw new AppError("No unit with this ID exists.", 404);
  }
  return existingUnit[0];
}
