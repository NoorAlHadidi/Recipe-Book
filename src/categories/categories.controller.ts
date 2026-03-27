import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import {
  addCategorySchema,
  categoriesService,
  categoryParamSchema,
  categoryQueryParamsSchema,
  editCategorySchema,
} from "@/categories";

class CategoriesController {
  addCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const addCategoryDto = addCategorySchema.parse(req.body);
    const newCategory = await categoriesService.addCategory(addCategoryDto);
    res.status(201).json(newCategory);
  });

  editCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const { categoryId } = categoryParamSchema.parse(req.params);
    const editCategoryDto = editCategorySchema.parse(req.body);
    const updatedCategory = await categoriesService.editCategory(
      categoryId,
      editCategoryDto,
    );
    res.status(200).json(updatedCategory);
  });

  removeCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const { categoryId } = categoryParamSchema.parse(req.params);
    await categoriesService.deleteCategory(categoryId);
    res.status(204).send();
  });

  getCategory = asyncErrorHandler(async (req: Request, res: Response) => {
    const { categoryId } = categoryParamSchema.parse(req.params);
    const category = await categoriesService.getCategory(categoryId);
    res.status(200).json(category);
  });

  getCategories = asyncErrorHandler(async (req: Request, res: Response) => {
    const categoryQueryParams = categoryQueryParamsSchema.parse(req.query);
    const categories =
      await categoriesService.getCategories(categoryQueryParams);
    res.status(200).json(categories);
  });
}

export const categoriesController = new CategoriesController();
