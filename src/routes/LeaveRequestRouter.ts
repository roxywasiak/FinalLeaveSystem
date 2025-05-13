// src/routes/LeaveRequestRouter.ts
import { Router } from "express";
import { IRouter } from "../interfaces/IRouter";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import { verifyToken } from "../middleware/authMiddleware";
import { authoriseRoles } from "../middleware/roleMiddleware";

export class LeaveRequestRouter implements IRouter {
  public routeName    = "LeaveRequest";
  public basePath     = "/api/leaverequests";
  public authenticate = true;

  private router = Router();
  private ctl    = new LeaveRequestController();

  constructor() {
    this.router.use(verifyToken);

    this.router.get(   "/",    this.ctl.getAll);
    this.router.get(   "/:id", this.ctl.getById);
    this.router.post(  "/",    this.ctl.create);

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
