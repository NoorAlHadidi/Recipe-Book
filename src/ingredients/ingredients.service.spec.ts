import { databaseClient } from "@/database";
import { AppError } from "@/errors";
import { ingredientsService } from "@/ingredients/ingredients.service";
import { checkIngredientExists } from "@/ingredients/ingredients.helper";
import { checkUnitExists } from "@/units/units.helper";

jest.mock("@/database", () => ({
  databaseClient: {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  ingredientsTable: {},
  unitsTable: {},
  ingredientsUnitsTable: {},
}));

jest.mock("@/ingredients/ingredients.helper", () => ({
  checkIngredientExists: jest.fn(),
}));

jest.mock("@/units/units.helper", () => ({
  checkUnitExists: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("IngredientsService", () => {
  describe("AddIngredient", () => {
    const ingredientDTO = { name: "mock_ingredient" };

    it("should create ingredient successfully", async () => {
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
            execute: () =>
              Promise.resolve([{ ingredientId: 1, name: "mock_ingredient" }]),
          }),
        }),
      });

      const result = await ingredientsService.addIngredient(ingredientDTO);

      expect(databaseClient.db.insert).toHaveBeenCalled();
      expect(result).toEqual({ ingredientId: 1, name: "mock_ingredient" });
    });

    it("should throw AppError with code 409 if ingredient exists", async () => {
      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ ingredientId: 1 }]),
          }),
        }),
      });

      await expect(
        ingredientsService.addIngredient(ingredientDTO),
      ).rejects.toThrow(AppError);
      await expect(
        ingredientsService.addIngredient(ingredientDTO),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("EditIngredient", () => {
    it("should update ingredient successfully", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      (databaseClient.db.update as jest.Mock).mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => ({
              execute: () =>
                Promise.resolve([
                  { ingredientId: 1, name: "updated_mock_ingredient" },
                ]),
            }),
          }),
        }),
      });

      const result = await ingredientsService.editIngredient(1, {
        name: "updated_mock_ingredient",
      });

      expect(checkIngredientExists).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ingredientId: 1,
        name: "updated_mock_ingredient",
      });
    });

    it("should throw AppError with code 409 if name conflict exists", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ ingredientId: 2 }]),
          }),
        }),
      });

      await expect(
        ingredientsService.editIngredient(1, { name: "mock_ingredient" }),
      ).rejects.toThrow(AppError);
      await expect(
        ingredientsService.editIngredient(1, { name: "mock_ingredient" }),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("DeleteIngredient", () => {
    it("should delete ingredient successfully", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.delete as jest.Mock).mockReturnValue({
        where: () => ({
          execute: () => Promise.resolve(),
        }),
      });

      await ingredientsService.deleteIngredient(1);

      expect(checkIngredientExists).toHaveBeenCalledWith(1);
      expect(databaseClient.db.delete).toHaveBeenCalled();
    });

    it("should throw AppError with code 404 if ingredient does not exist", async () => {
      (checkIngredientExists as jest.Mock).mockRejectedValue(
        new AppError("No ingredient with this ID exists.", 404),
      );

      await expect(ingredientsService.deleteIngredient(1)).rejects.toThrow(
        AppError,
      );
      await expect(
        ingredientsService.deleteIngredient(1),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("GetIngredient", () => {
    it("should return ingredient", async () => {
      const mockIngredient = { ingredientId: 1, name: "mock_ingredient" };

      (checkIngredientExists as jest.Mock).mockResolvedValue(mockIngredient);

      const result = await ingredientsService.getIngredient(1);
      expect(checkIngredientExists).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockIngredient);
    });

    it("should throw AppError with code 404 if ingredient does not exist", async () => {
      (checkIngredientExists as jest.Mock).mockRejectedValue(
        new AppError("No ingredient with this ID exists.", 404),
      );

      await expect(ingredientsService.getIngredient(1)).rejects.toThrow(
        AppError,
      );
      await expect(ingredientsService.getIngredient(1)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("GetIngredients", () => {
    it("should return all ingredients", async () => {
      const mockIngredients = [
        { ingredientId: 1, name: "mock_ingredient_1" },
        { ingredientId: 2, name: "mock_ingredient_2" },
      ];

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          execute: () => Promise.resolve(mockIngredients),
        }),
      });

      const result = await ingredientsService.getIngredients({});

      expect(result).toEqual(mockIngredients);
    });
  });

  describe("AddIngredientUnit", () => {
    it("should add unit to ingredient", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});
      (checkUnitExists as jest.Mock).mockResolvedValue({});

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
            execute: () => Promise.resolve([{ ingredientId: 1, unitId: 1 }]),
          }),
        }),
      });

      const result = await ingredientsService.addIngredientUnit(1, {
        unitId: 1,
      });

      expect(checkIngredientExists).toHaveBeenCalledWith(1);
      expect(checkUnitExists).toHaveBeenCalledWith(1);

      expect(result).toEqual({ ingredientId: 1, unitId: 1 });
    });

    it("should throw AppError with code 409 if relation exists", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});
      (checkUnitExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ ingredientId: 1, unitId: 1 }]),
          }),
        }),
      });

      await expect(
        ingredientsService.addIngredientUnit(1, { unitId: 1 }),
      ).rejects.toThrow(AppError);
      await expect(
        ingredientsService.addIngredientUnit(1, { unitId: 1 }),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("GetIngredientUnits", () => {
    it("should return ingredient units", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});

      const mockUnits = [{ unitId: 1, unitName: "mock_unit" }];

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          innerJoin: () => ({
            where: () => ({
              execute: () => Promise.resolve(mockUnits),
            }),
          }),
        }),
      });

      const result = await ingredientsService.getIngredientUnits(1);

      expect(result).toEqual(mockUnits);
    });
  });

  describe("DeleteIngredientUnit", () => {
    it("should delete ingredient unit", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});
      (checkUnitExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([{ ingredientId: 1, unitId: 1 }]),
          }),
        }),
      });

      (databaseClient.db.delete as jest.Mock).mockReturnValue({
        where: () => ({
          execute: () => Promise.resolve(),
        }),
      });

      await ingredientsService.deleteIngredientUnit(1, 1);

      expect(databaseClient.db.delete).toHaveBeenCalled();
    });

    it("should throw AppError with code 404 if relation does not exist", async () => {
      (checkIngredientExists as jest.Mock).mockResolvedValue({});
      (checkUnitExists as jest.Mock).mockResolvedValue({});

      (databaseClient.db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: () => ({
            execute: () => Promise.resolve([]),
          }),
        }),
      });

      await expect(
        ingredientsService.deleteIngredientUnit(1, 1),
      ).rejects.toThrow(AppError);
      await expect(
        ingredientsService.deleteIngredientUnit(1, 1),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
