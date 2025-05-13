import { UserManagementController } from './UserManagementController';
import { AppDataSource } from '../data-source';
import { validate } from 'class-validator';
import { ResponseHandler } from '../helper/ResponseHandler';
import { AppError } from '../helper/AppError';
import { UserManagement } from '../entity/UserManagement';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

// Mock modules
jest.mock('../data-source', () => ({
  AppDataSource: { getRepository: jest.fn() }
}));
jest.mock('class-validator');
jest.mock('../helper/ResponseHandler');

describe('UserManagementController', () => {
  let controller: UserManagementController;
  let mockRepo: any;

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();

    // Stub repository methods
    mockRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

    controller = new UserManagementController();
  });

  it('getAll should return list of entities', async () => {
    const fakeList = [{ id: 1 }, { id: 2 }];
    mockRepo.find.mockResolvedValue(fakeList);

    const sendSuccess = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ send: sendSuccess }) } as any;

    await controller.getAll({} as Request, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      fakeList,
      StatusCodes.OK
    );
  });

  it('getById throws if id invalid', async () => {
    const req = { params: { id: 'abc' } } as any;
    const res = {} as any;
    await expect(controller.getById(req, res)).rejects.toThrow(AppError);
  });

  it('getById throws if not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const req = { params: { id: '5' } } as any;
    const res = {} as any;
    await expect(controller.getById(req, res)).rejects.toThrow(
      `UserManagement not found with ID 5`
    );
  });

  it('getById returns entity when found', async () => {
    const fakeEntity = { id: 3, userId: 1, managerId: 2 };
    mockRepo.findOneBy.mockResolvedValue(fakeEntity as UserManagement);

    await controller.getById(
      { params: { id: '3' } } as any,
      { status: jest.fn().mockReturnValue({ send: jest.fn() }) } as any
    );

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      expect.any(Object),
      fakeEntity,
      StatusCodes.OK
    );
  });

  it('create throws on validation errors', async () => {
    const dto = new UserManagement();
    mockRepo.create.mockReturnValue(dto);
    (validate as jest.Mock).mockResolvedValue([
      { constraints: { isNotEmpty: 'error' } }
    ]);

    const req = { body: {} } as any;
    const res = {} as any;
    await expect(controller.create(req, res)).rejects.toThrow(AppError);
  });

  it('create succeeds with valid input', async () => {
    const dto = new UserManagement();
    const saved = { id: 10 };
    mockRepo.create.mockReturnValue(dto);
    (validate as jest.Mock).mockResolvedValue([]);
    mockRepo.save.mockResolvedValue(saved);

    const req = {
      body: { userId: 1, managerId: 2, startDate: '2025-05-01', endDate: '2025-05-02' }
    } as any;
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) } as any;

    await controller.create(req, res);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalledWith(dto);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      saved,
      StatusCodes.CREATED
    );
  });

  it('update throws if id invalid', async () => {
    const req = { params: { id: 'foo' } } as any;
    const res = {} as any;
    await expect(controller.update(req, res)).rejects.toThrow(AppError);
  });

  it('update throws if entity not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    const req = { params: { id: '7' }, body: {} } as any;
    const res = {} as any;
    await expect(controller.update(req, res)).rejects.toThrow(
      `UserManagement not found with ID 7`
    );
  });

  it('update succeeds with valid input', async () => {
    const existing = new UserManagement();
    existing.id = 5;
    existing.userId = 1;
    existing.managerId = 2;
    existing.startDate = new Date('2025-01-01');
    existing.endDate = new Date('2025-01-02');

    mockRepo.findOneBy.mockResolvedValue(existing);
    (validate as jest.Mock).mockResolvedValue([]);
    mockRepo.save.mockResolvedValue(existing);

    const req = {
      params: { id: '5' },
      body: { userId: 3 }
    } as any;
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) } as any;

    await controller.update(req, res);

    expect(existing.userId).toBe(3);
    expect(mockRepo.save).toHaveBeenCalledWith(existing);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      existing,
      StatusCodes.OK
    );
  });

  it('delete throws if id invalid', async () => {
    const req = { params: { id: 'bar' } } as any;
    const res = {} as any;
    await expect(controller.delete(req, res)).rejects.toThrow(AppError);
  });

  it('delete throws if nothing deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    const req = { params: { id: '9' } } as any;
    const res = {} as any;
    await expect(controller.delete(req, res)).rejects.toThrow(
      `UserManagement not found with ID 9`
    );
  });

  it('delete succeeds when entity deleted', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    const req = { params: { id: '9' } } as any;
    const res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) } as any;

    await controller.delete(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      null,
      StatusCodes.NO_CONTENT
    );
  });
});
