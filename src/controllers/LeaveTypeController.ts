// src/controllers/LeaveTypeController.ts
import { Request, Response } from "express";
import { Repository }        from "typeorm";
import { StatusCodes }       from "http-status-codes";
import { validate }          from "class-validator";
import { LeaveType }         from "../entity/LeaveType";
import { AppDataSource }     from "../data-source";
import { AppError }          from "../helper/AppError";
import { ResponseHandler }   from "../helper/ResponseHandler";
import { IEntityController } from "./IEntityController";

export class LeaveTypeController implements IEntityController {
  private repo: Repository<LeaveType>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveType);
  }

  getAll = async (_req: Request, res: Response) => {
    const all = await this.repo.find();
    ResponseHandler.sendSuccessResponse(res, all);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID");
    const entity = await this.repo.findOneBy({ leaveTypeId: id });
    if (!entity) throw new AppError(`Not found ID ${id}`);
    ResponseHandler.sendSuccessResponse(res, entity);
  };

  create = async (req: Request, res: Response) => {
    const dto = this.repo.create(req.body as Partial<LeaveType>);
    const errors = await validate(dto);
    if (errors.length) throw new AppError(errors.map(e => Object.values(e.constraints!)).join(", "));
    const saved = await this.repo.save(dto);
    ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.CREATED);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID");
    let entity = await this.repo.findOneBy({ leaveTypeId: id });
    if (!entity) throw new AppError(`Not found ID ${id}`);
    Object.assign(entity, req.body);
    const errors = await validate(entity);
    if (errors.length) throw new AppError(errors.map(e => Object.values(e.constraints!)).join(", "));
    const saved = await this.repo.save(entity);
    ResponseHandler.sendSuccessResponse(res, saved);
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID");
    await this.repo.delete(id);
    ResponseHandler.sendSuccessResponse(res, null, StatusCodes.NO_CONTENT);
  };
}
