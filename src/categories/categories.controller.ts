import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addCategorySchema, categoriesService } from "@/categories";

class CategoriesController {
  addCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const addCategoryDto = addCategorySchema.parse(req.body);
    const newCategory = await categoriesService.addCategory(addCategoryDto);
    res.status(201).json(newCategory);
  });
}

export const categoriesController = new CategoriesController();
