import { body, query, validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
}

export const createContentValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 256 })
    .withMessage("Title must be between 3 and 256 characters"),
  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL({ require_protocol: true })
    .withMessage("URL must be valid and include protocol"),
  body("type")
    .optional()
    .isIn([
      "article",
      "youtube",
      "tweet",
      "pdf",
      "document",
      "image",
      "linkedin",
      "instagram",
      "github",
      "x",
    ])
    .withMessage("Invalid content type"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),
  body("tags.*")
    .optional()
    .isString()
    .trim()
    .withMessage("Each tag must be a string"),
  body("category").optional().trim().isString(),
  body("subCategory").optional().trim().isString(),
  validateRequest,
];

export const updateContentValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 256 })
    .withMessage("Title must be between 3 and 256 characters"),
  body("url")
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage("URL must be valid and include protocol"),
  body("type")
    .optional()
    .isIn([
      "article",
      "youtube",
      "tweet",
      "pdf",
      "document",
      "image",
      "linkedin",
      "instagram",
      "github",
      "x",
    ])
    .withMessage("Invalid content type"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),
  body("tags.*")
    .optional()
    .isString()
    .trim()
    .withMessage("Each tag must be a string"),
  body("category").optional().trim().isString(),
  body("subCategory").optional().trim().isString(),
  validateRequest,
];

export const listContentValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validateRequest,
];
