import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addUnitSchema, unitParamSchema, unitsService } from "@/units";

class UnitsController {
  addUnit = asyncErrorHandler(async (req: Request, res: Response) => {
    const addUnitDto = addUnitSchema.parse(req.body);
    const newUnit = await unitsService.addIngredient(addUnitDto);
    res.status(201).json(newUnit);
  });

  removeUnit = asyncErrorHandler(async (req: Request, res: Response) => {
    const { unitId } = unitParamSchema.parse(req.params);
    await unitsService.deleteUnit(unitId);
    res.status(204).send();
  });

  getUnit = asyncErrorHandler(async (req: Request, res: Response) => {
    const { unitId } = unitParamSchema.parse(req.params);
    const unit = await unitsService.getUnit(unitId);
    res.status(200).json(unit);
  });

  getUnits = asyncErrorHandler(async (req: Request, res: Response) => {
    const units = await unitsService.getUnits();
    res.status(200).json(units);
  });
}

export const unitsController = new UnitsController();
