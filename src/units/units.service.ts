import { databaseClient, unitsTable } from "@/database";
import { AppError } from "@/errors";
import { AddUnitDTO, checkUnitExists } from "@/units";
import { eq } from "drizzle-orm";

class UnitsService {
  async addUnit(addUnitDTO: AddUnitDTO) {
    const { name } = addUnitDTO;
    const existingUnit = await databaseClient.db
      .select()
      .from(unitsTable)
      .where(eq(unitsTable.name, name))
      .execute();
    if (existingUnit.length > 0) {
      throw new AppError("This unit already exists.", 409);
    }
    const newUnit = await databaseClient.db
      .insert(unitsTable)
      .values({
        name: name,
      })
      .returning({
        unitId: unitsTable.unitId,
        name: unitsTable.name,
      })
      .execute();
    return newUnit[0];
  }

  async deleteUnit(unitId: number) {
    await checkUnitExists(unitId);
    await databaseClient.db
      .delete(unitsTable)
      .where(eq(unitsTable.unitId, unitId))
      .execute();
  }

  async getUnit(unitId: number) {
    return await checkUnitExists(unitId);
  }

  async getUnits() {
    const units = await databaseClient.db.select().from(unitsTable).execute();
    return units;
  }
}

export const unitsService = new UnitsService();
