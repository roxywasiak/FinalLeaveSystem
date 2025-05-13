// src/routes/LeaveTypeRouter.ts
import { Router }          from "express";
import { IRouter }         from "../interfaces/IRouter";
import { LeaveTypeController } from "../controllers/LeaveTypeController";

export class LeaveTypeRouter implements IRouter {
  routeName    = "LeaveType";
  basePath     = "/api/leavetypes";
  authenticate = true;

  private router = Router();
  private ctl    = new LeaveTypeController();

  constructor() {
    this.router.get(   "/",        this.ctl.getAll);
    this.router.get(   "/:id",     this.ctl.getById);
    this.router.post(  "/",        this.ctl.create);
    this.router.patch( "/:id",     this.ctl.update);
    this.router.delete("/:id",     this.ctl.delete);
  }

  getRouter() {
    return this.router;
  }
}
