import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { addCategorySchema, categoriesService, categoryParamSchema, editCategorySchema } from "@/categories";

class CategoriesController {
  addCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const addCategoryDto = addCategorySchema.parse(req.body);
    const newCategory = await categoriesService.addCategory(addCategoryDto);
    res.status(201).json(newCategory);
  });

  editCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const { categoryId } = categoryParamSchema.parse(req.params);
    const editCategoryDto = editCategorySchema.parse(req.body);
    const updatedCategory = await categoriesService.editCategory(categoryId, editCategoryDto);
    res.status(200).json(updatedCategory);
  })
}

export const categoriesController = new CategoriesController();
