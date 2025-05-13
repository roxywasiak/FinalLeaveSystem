// src/routes/UserManagementRouter.ts
import { Router } from "express";
import { IRouter } from "../interfaces/IRouter";
import { UserManagementController } from "../controllers/UserManagementController";
import { verifyToken } from "../middleware/authMiddleware";
import { authoriseRoles } from "../middleware/roleMiddleware";


export class UserManagementRouter implements IRouter {
  public routeName    = "UserManagement";
  public basePath     = "/api/usermanagement";
  public authenticate = true;

  private router = Router();
  private ctl    = new UserManagementController();

  constructor() {
    this.router.use(verifyToken);

    this.router.get(
      "/",
      authoriseRoles("manager", "admin"),
      this.ctl.getAll
    );
    this.router.get(
      "/:id",
      authoriseRoles("manager", "admin"),
      this.ctl.getById
    );
    this.router.post(
      "/",
      authoriseRoles("manager", "admin"),
      this.ctl.create
    );
    this.router.patch(
      "/:id",
      authoriseRoles("manager", "admin"),
      this.ctl.update
    );
    this.router.delete(
      "/:id",
      authoriseRoles("manager", "admin"),
      this.ctl.delete
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
