import { Request, Response } from "express";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { validate } from "class-validator";
import { UserManagement } from "../entity/UserManagement";
import { AppDataSource } from "../data-source";
import { ResponseHandler } from "../helper/ResponseHandler";
import { AppError } from "../helper/AppError";
import { IEntityController } from "./IEntityController";

export class UserManagementController implements IEntityController {
  private repo: Repository<UserManagement>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserManagement);
  }

  public getAll = async (_req: Request, res: Response): Promise<void> => {
    const all = await this.repo.find();
    ResponseHandler.sendSuccessResponse(res, all, StatusCodes.OK);
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("Invalid ID format");
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new AppError(`UserManagement not found with ID ${id}`);
    ResponseHandler.sendSuccessResponse(res, entity, StatusCodes.OK);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const dto = this.repo.create({
      userId:    req.body.userId,
      managerId: req.body.managerId,
      startDate: new Date(req.body.startDate),
      endDate:   new Date(req.body.endDate),
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
    let entity = await this.repo.findOneBy({ id });
    if (!entity) throw new AppError(`UserManagement not found with ID ${id}`);

    Object.assign(entity, {
      userId:    req.body.userId    ?? entity.userId,
      managerId: req.body.managerId ?? entity.managerId,
      startDate: req.body.startDate ? new Date(req.body.startDate) : entity.startDate,
      endDate:   req.body.endDate   ? new Date(req.body.endDate)   : entity.endDate,
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
      throw new AppError(`UserManagement not found with ID ${id}`);
    }
    ResponseHandler.sendSuccessResponse(res, null, StatusCodes.NO_CONTENT);
  };
}
