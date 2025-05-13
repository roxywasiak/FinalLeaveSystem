// src/controllers/LeaveRequestController.ts
import { Request, Response } from "express";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { validate } from "class-validator";
import { LeaveRequest, LeaveStatus } from "../entity/LeaveRequest";
import { AppDataSource } from "../data-source";
import { ResponseHandler } from "../helper/ResponseHandler";
import { AppError } from "../helper/AppError";
import { IEntityController } from "./IEntityController";

export class LeaveRequestController implements IEntityController {
  private repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveRequest);
  }

  public getAll = async (_req: Request, res: Response): Promise<void> => {
    const all = await this.repo.find();
    ResponseHandler.sendSuccessResponse(res, all, StatusCodes.OK);
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID format");
    const entity = await this.repo.findOneBy({ leaveRequestId: id });
    if (!entity) throw new AppError(`LeaveRequest not found with ID ${id}`);
    ResponseHandler.sendSuccessResponse(res, entity, StatusCodes.OK);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const dto = this.repo.create({
      userId:      req.body.userId,
      leaveTypeId: req.body.leaveTypeId,
      startDate:   new Date(req.body.startDate),
      endDate:     new Date(req.body.endDate),
      status:      req.body.status ?? LeaveStatus.Pending,
      reason:      req.body.reason,
    });
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new AppError(
        errors.map(e => Object.values(e.constraints || {})).join(", ")
      );
    }
    const saved = await this.repo.save(dto);
    ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.CREATED);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID format");
    let entity = await this.repo.findOneBy({ leaveRequestId: id });
    if (!entity) throw new AppError(`LeaveRequest not found with ID ${id}`);

    Object.assign(entity, {
      userId:      req.body.userId      ?? entity.userId,
      leaveTypeId: req.body.leaveTypeId ?? entity.leaveTypeId,
      startDate:   req.body.startDate   ? new Date(req.body.startDate) : entity.startDate,
      endDate:     req.body.endDate     ? new Date(req.body.endDate)   : entity.endDate,
      status:      req.body.status      ?? entity.status,
      reason:      req.body.reason      ?? entity.reason,
    });

    const errors = await validate(entity);
    if (errors.length > 0) {
      throw new AppError(
        errors.map(e => Object.values(e.constraints || {})).join(", ")
      );
    }
    const saved = await this.repo.save(entity);
    ResponseHandler.sendSuccessResponse(res, saved, StatusCodes.OK);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID format");
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new AppError(`LeaveRequest not found with ID ${id}`);
    }
    ResponseHandler.sendSuccessResponse(res, null, StatusCodes.NO_CONTENT);
  };
  
    async cancel(req: Request, res: Response): Promise<void> {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid ID', StatusCodes.BAD_REQUEST);
      }
  
      const result = await this.repo.update(id, { status: LeaveStatus.Cancelled });
      if (result.affected === 0) {
        throw new AppError('Leave request not found', StatusCodes.NOT_FOUND);
      }
  
      ResponseHandler.sendSuccessResponse(res, { message: 'Leave request cancelled successfully' });
    }
  }

