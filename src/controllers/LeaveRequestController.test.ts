import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes }     from 'http-status-codes';
import * as classValidator from 'class-validator';

import { LeaveRequestController } from '../controllers/LeaveRequestController';
import { LeaveRequest }           from '../entity/LeaveRequest';
import { ResponseHandler }        from '../helper/ResponseHandler';
import { AppError }               from '../helper/AppError';
import { LeaveStatus }            from '../entity/LeaveRequest'; 

jest.mock('../../helper/ResponseHandler');
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('LeaveRequestController', () => {
  const INVALID_ID   = 'abc';
  const NOT_FOUND_ID = '99';

  function makeRequest(
    id = 1,
    userId = 5,
    leaveTypeId = 2,
    start = new Date('2025-07-01'),
    end   = new Date('2025-07-03'),
    status: LeaveStatus = 'Pending' as LeaveStatus,
    reason = 'Trip'
  ): LeaveRequest {
    const lr = new LeaveRequest();
    lr.leaveRequestId = id;
    lr.userId         = userId;
    lr.leaveTypeId    = leaveTypeId;
    lr.startDate      = start;
    lr.endDate        = end;
    lr.status         = status as LeaveStatus;
    lr.reason         = reason;
    return lr;
  }

  let repo: jest.Mocked<Repository<LeaveRequest>>;
  let ctrl: LeaveRequestController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    repo = mock() as jest.Mocked<Repository<LeaveRequest>>;
    ctrl = new LeaveRequestController();
    ;(ctrl as any).repo = repo;     // inject the mock

    req = { params: {}, body: {} };
    res = {};
    jest.clearAllMocks();
  });

  describe('getAll()', () => {
    it('204 when no requests', async () => {
      repo.find.mockResolvedValue([]);
      await ctrl.getAll(req as Request, res as Response);
      expect(ResponseHandler.sendErrorResponse)
        .toHaveBeenCalledWith(res, StatusCodes.NO_CONTENT);
    });

    it('200 with data', async () => {
      const list = [ makeRequest(), makeRequest(2) ];
      repo.find.mockResolvedValue(list);
      await ctrl.getAll(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, list);
    });
  });

  describe('getById()', () => {
    it('400 on invalid id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.getById(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('404 when not found', async () => {
      req.params = { id: NOT_FOUND_ID };
      repo.findOne.mockResolvedValue(null);
      await expect(ctrl.getById(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('200 when found', async () => {
      const lr = makeRequest(3);
      req.params = { id: '3' };
      repo.findOne.mockResolvedValue(lr);
      await ctrl.getById(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, lr);
    });
  });

  describe('create()', () => {
    it('400 on validation errors', async () => {
      req.body = { /* leave out required fields */ };
      (classValidator.validate as jest.Mock).mockResolvedValue([
        { constraints: { isNotEmpty: 'Start date required' } }
      ]);
      await expect(ctrl.create(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('201 on success', async () => {
      const dto = makeRequest();
      req.body = {
        userId: dto.userId,
        leaveTypeId: dto.leaveTypeId,
        startDate: dto.startDate.toISOString(),
        endDate: dto.endDate.toISOString(),
        reason: dto.reason,
        status: dto.status
      };
      (classValidator.validate as jest.Mock).mockResolvedValue([]);
      repo.save.mockResolvedValue(dto);

      await ctrl.create(req as Request, res as Response);
      expect(repo.save).toHaveBeenCalled();
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, dto, StatusCodes.CREATED);
    });
  });

  describe('update()', () => {
    it('400 on invalid id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('404 when not found', async () => {
      req.params = { id: '5' };
      repo.findOne.mockResolvedValue(null);
      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('400 on validation error', async () => {
      const existing = makeRequest(1);
      req.params = { id: '1' };
      req.body = { status: '' };
      repo.findOne.mockResolvedValue(existing);
      (classValidator.validate as jest.Mock).mockResolvedValue([
        { constraints: { isNotEmpty: 'Status required' } }
      ]);

      await expect(ctrl.update(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('200 on success', async () => {
      const existing = makeRequest(1);
      const updated  = makeRequest(1, existing.userId, existing.leaveTypeId, existing.startDate, existing.endDate, LeaveStatus.Approved, existing.reason);
      req.params = { id: '1' };
      req.body   = { status: 'Approved', reason: existing.reason };
      repo.findOne.mockResolvedValue(existing);
      (classValidator.validate as jest.Mock).mockResolvedValue([]);
      repo.save.mockResolvedValue(updated);

      await ctrl.update(req as Request, res as Response);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'Approved' }));
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, updated);
    });
  });

  describe('cancel()', () => {
    it('400 on invalid id', async () => {
      req.params = { id: INVALID_ID };
      await expect(ctrl.cancel(req as Request, res as Response))
        .rejects.toBeInstanceOf(AppError);
    });

    it('200 on success', async () => {
      req.params = { id: '2' };
      repo.update.mockResolvedValue({ affected: 1 } as any);
      await ctrl.cancel(req as Request, res as Response);
      expect(ResponseHandler.sendSuccessResponse)
        .toHaveBeenCalledWith(res, expect.anything());
    });
  });
});
