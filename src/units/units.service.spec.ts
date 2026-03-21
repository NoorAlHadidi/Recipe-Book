import { databaseClient } from "@/database";
import { AppError } from "@/errors";
import { unitsService } from "@/units/units.service";
import { checkUnitExists } from "@/units/units.helper";

jest.mock("@/database", () => ({
  databaseClient: {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    },
  },
  unitsTable: {},
}));

jest.mock("@/units/units.helper", () => ({
  checkUnitExists: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UnitsService", () => {
  describe("AddUnit", () => {
    const unitDTO = { name: "mock_unit" };

    it("should create unit successfully", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      (databaseClient.db.insert as jest.Mock).mockReturnValue({
        values: () => ({
          returning: () => ({
            execute: () => Promise.resolve([{ unitId: 1, name: "mock_unit" }]),
          }),
        }),
      });

      const result = await unitsService.addUnit(unitDTO);

      expect(databaseClient.db.insert).toHaveBeenCalled();
      expect(result).toEqual({ unitId: 1, name: "mock_unit" });
    });

    it("should throw AppError with code 409 if unit already exists", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ unitId: 1 }]),
          }),
        }),
      });

      await expect(unitsService.addUnit(unitDTO)).rejects.toThrow(AppError);
      await expect(unitsService.addUnit(unitDTO)).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(databaseClient.db.insert).not.toHaveBeenCalled();
    });
  });

  describe("DeleteUnit", () => {
    it("should delete unit successfully", async () => {
      (checkUnitExists as jest.Mock).mockResolvedValue({
        unitId: 1,
        name: "mock_unit",
      });

      (databaseClient.db.delete as jest.Mock).mockReturnValue({
        where: () => ({
          execute: () => Promise.resolve(),
        }),
      });

      await unitsService.deleteUnit(1);

      expect(checkUnitExists).toHaveBeenCalledWith(1);
      expect(databaseClient.db.delete).toHaveBeenCalled();
    });

    it("should throw AppError with code 404 if unit does not exist", async () => {
      (checkUnitExists as jest.Mock).mockRejectedValue(
        new AppError("No unit with this ID exists.", 404),
      );

      await expect(unitsService.deleteUnit(1)).rejects.toThrow(AppError);
      await expect(unitsService.deleteUnit(1)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("GetUnit", () => {
    it("should return unit if exists", async () => {
      const mockUnit = { unitId: 1, name: "mock_unit" };

      (checkUnitExists as jest.Mock).mockResolvedValue(mockUnit);

      const result = await unitsService.getUnit(1);

      expect(checkUnitExists).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUnit);
    });

    it("should throw AppError with code 404 if unit does not exist", async () => {
      (checkUnitExists as jest.Mock).mockRejectedValue(
        new AppError("No unit with this ID exists.", 404),
      );

      await expect(unitsService.getUnit(1)).rejects.toThrow(AppError);
      await expect(unitsService.getUnit(1)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("GetUnits", () => {
    it("should return all units", async () => {
      const mockUnits = [
        { unitId: 1, name: "mock_unit_1" },
        { unitId: 2, name: "mock_unit_2" },
      ];

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          execute: () => Promise.resolve(mockUnits),
        }),
      });

      const result = await unitsService.getUnits();

      expect(databaseClient.db.select).toHaveBeenCalled();
      expect(result).toEqual(mockUnits);
    });
  });
});
