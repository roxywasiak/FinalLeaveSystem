// src/middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from "express";

export function authoriseRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role; // Assuming req.user is populated
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}