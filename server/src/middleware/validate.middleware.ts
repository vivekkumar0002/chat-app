import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiError } from "../utils/ApiError";

// Runs an array of express-validator chains, then short-circuits
// with a 400 ApiError if any validation failed.
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    next(ApiError.badRequest("Validation failed", errors.array()));
  };
}
