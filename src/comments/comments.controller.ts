import { Request, Response } from "express";
import { asyncErrorHandler } from "@/errors";
import { recipeParamSchema } from "@/recipes";
import { addCommentSchema, commentParamSchema, commentsService } from "@/comments";

class CommentsController {
  addComment = asyncErrorHandler(async (req: Request, res: Response) => {
    const addCommentDTO = addCommentSchema.parse(req.body);
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const newComment = await commentsService.addComment(userId, recipeId, addCommentDTO);
    res.status(201).json(newComment);
  });

  editComment = asyncErrorHandler(async (req: Request, res: Response) => {
    const addCommentDTO = addCommentSchema.parse(req.body);
    const { commentId } = commentParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const updatedComment = await commentsService.editComment(userId, commentId, addCommentDTO);
    res.status(200).json(updatedComment);
  });
 
  removeComment = asyncErrorHandler(async (req: Request, res: Response) => {
    const { commentId } = commentParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    await commentsService.deleteComment(userId, userRole, commentId);
    res.status(204).send();
  });

  getRecipeComments = asyncErrorHandler(async (req: Request, res: Response) => {
    const { recipeId } = recipeParamSchema.parse(req.params);
    const userId = req.user!.sub;
    const comments = await commentsService.getRecipeComments(userId, recipeId);
    res.status(200).json(comments);
  });
}

export const commentsController = new CommentsController();
