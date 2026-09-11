import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodTypeAny } from "zod";
import { sendError } from "../utils/ApiResponse";

// Validates req.body/query/params against a Zod schema before the controller runs.
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const anySchema = schema as any;
      const shape = anySchema.shape || anySchema._def?.schema?.shape;
      if (shape && ("body" in shape || "query" in shape || "params" in shape)) {
        schema.parse({ body: req.body, query: req.query, params: req.params });
      } else {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
        return sendError(res, 400, "Validation failed", errors);
      }
      next(err);
    }
  };
}

// Validates req.body directly
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
        return sendError(res, 400, "Validation failed", errors);
      }
      next(err);
    }
  };
}
