import { mock } from 'jest-mock-extended';
import type { DeepMockProxy } from 'jest-mock-extended';
// import { MockProxy } from 'jest-mock-extended';
import { Repository, DeleteResult } from 'typeorm';
import { Request, Response }       from 'express';
import { StatusCodes }             from 'http-status-codes';
import * as classValidator         from 'class-validator';

import { LeaveTypeController }     from './LeaveTypeController';
import { LeaveType }               from '../entity/LeaveType';
import { ResponseHandler }         from '../helper/ResponseHandler';
import { AppError }                from '../helper/AppError';

jest.mock('../helper/ResponseHandler');
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('LeaveTypeController', () => {
 
  const INVALID_ID      = 'abc';
  const NOT_FOUND_ID    = '99';

  
  function makeLeaveType(
    id: number = 1,
    name: string = 'Vacation',
    description = 'Annual leave',
    initialBalance = 25,
    maxRollOverDays = 5
  ): LeaveType {
    const t = new LeaveType();
    t.leaveTypeId      = id;
    t.name             = name;
    t.description      = description;
    t.initialBalance   = initialBalance;
    t.maxRollOverDays  = maxRollOverDays;
    return t;
  }

  let mockRepo:jest.Mocked<Repository<LeaveType>>;
  let ctrl: LeaveTypeController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockRepo = mock() as jest.Mocked<Repository<LeaveType>>;
    ctrl = new LeaveTypeController();
    (ctrl as any).repo = mockRepo;

    req = { params: {}, body: {} };
    res = {};
    jest.clearAllMocks();
  });

  describe('getAll()', () => {
    it('returns all leave types', async () => {
      const list = [ makeLeaveType(), makeLeaveType(2, 'Sick') ];
      mockRepo.find.mockResolvedValue(list);

      await ctrl.getAll(req as Request, res as Response);

      expect(mockRepo.find).toHaveBeenCalled();
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, list);
    });
  });

  describe('getById()', () => {
    it('throws AppError on non-numeric id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.getById(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('throws AppError when not found', async () => {
      req.params = { id: NOT_FOUND_ID };
      mockRepo.findOneBy.mockResolvedValue(null);
      await expect(ctrl.getById(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('returns the leave type when found', async () => {
      const entity = makeLeaveType(3, 'Bereavement');
      req.params = { id: '3' };
      mockRepo.findOneBy.mockResolvedValue(entity);

      await ctrl.getById(req as Request, res as Response);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ leaveTypeId: 3 });
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, entity);
    });
  });

  describe('create()', () => {
    it('throws AppError if validation fails', async () => {
      // simulate a constraint error
      (classValidator.validate as jest.Mock).mockResolvedValue([
        { constraints: { isNotEmpty: 'Name is required' } }
      ]);

      await expect(ctrl.create(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('saves and returns 201 on valid data', async () => {
      const dto = makeLeaveType();
      req.body = {
        name:            dto.name,
        description:     dto.description,
        initialBalance:  dto.initialBalance,
        maxRollOverDays: dto.maxRollOverDays
      };
      (classValidator.validate as jest.Mock).mockResolvedValue([]);
      mockRepo.save.mockResolvedValue(dto);

      await ctrl.create(req as Request, res as Response);

      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: dto.name }));
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, dto, StatusCodes.CREATED);
    });
  });

  describe('update()', () => {
    it('throws AppError on non-numeric id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('throws AppError when entity not found', async () => {
      req.params = { id: '5' };
      mockRepo.findOneBy.mockResolvedValue(null);
      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('throws AppError if validation fails', async () => {
      const existing = makeLeaveType(1);
      req.params = { id: '1' };
      req.body   = { name: '' };
      mockRepo.findOneBy.mockResolvedValue(existing);
      (classValidator.validate as jest.Mock).mockResolvedValue([
        { constraints: { isNotEmpty: 'Name required' } }
      ]);

      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('saves and returns updated entity on valid data', async () => {
      const existing = makeLeaveType(1, 'Holiday');
      const updated  = makeLeaveType(1, 'UpdatedHoliday');
      req.params = { id: '1' };
      req.body   = { name: 'UpdatedHoliday' };
      mockRepo.findOneBy.mockResolvedValue(existing);
      (classValidator.validate as jest.Mock).mockResolvedValue([]);
      mockRepo.save.mockResolvedValue(updated);

      await ctrl.update(req as Request, res as Response);

      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'UpdatedHoliday' }));
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, updated);
    });
  });

  describe('delete()', () => {
    it('throws AppError on non-numeric id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.delete(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('returns 204 on successful delete', async () => {
      req.params = { id: '2' };
      mockRepo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await ctrl.delete(req as Request, res as Response);

      expect(mockRepo.delete).toHaveBeenCalledWith(2);
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, null, StatusCodes.NO_CONTENT);
    });
  });
});
