import { Router } from "express";

export const router = Router();

/**
 * @swagger
 * /check:
 *   post:
 *     summary: Dummy POST endpoint for testing
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: Created
 *                 status:
 *                   type: string
 *                   example: Success
 */
router.post("", (req, res) => {
  res.status(201).json({ operation: "Created", status: "Success" });
});


/**
 * @swagger
 * /check:
 *   get:
 *     summary: Dummy GET endpoint for testing
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: Read
 *                 status:
 *                   type: string
 *                   example: Success
 */
router.get("", (req, res) => {    
    res.status(200).json({ operation: "Read", status: "Success" });
});