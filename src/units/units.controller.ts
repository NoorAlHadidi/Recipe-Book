import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addUnitSchema,
  unitsService,
} from "@/units";

class UnitsController {
  addUnit = asyncErrorHandler(async (req: Request, res: Response) => {
    const addUnitDto = addUnitSchema.parse(req.body);
    const newUnit = await unitsService.addIngredient(addUnitDto);
    res.status(201).json(newUnit);
  });
}

export const unitsController = new UnitsController();
