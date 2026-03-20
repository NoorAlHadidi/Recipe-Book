import { databaseClient, unitsTable } from "@/database";
import { AppError } from "@/errors";
import { AddUnitDTO } from "@/units";
import { eq } from "drizzle-orm";

class UnitsService {
  async addIngredient(addUnitDTO: AddUnitDTO) {
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
}

export const unitsService = new UnitsService();
