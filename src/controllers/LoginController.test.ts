import { LoginController } from './LoginController';
import { AppDataSource } from '../data-source';
import { PasswordHandler } from '../helper/PasswordHandler';
import jwt from 'jsonwebtoken';
import { AppError } from '../helper/AppError';
import { User } from '../entity/User';

jest.mock('../data-source', () => ({
  AppDataSource: { getRepository: jest.fn() }
}));
jest.mock('../helper/PasswordHandler');
jest.mock('jsonwebtoken');

describe('LoginController', () => {
  let controller: LoginController;
  let mockRepo: any;
  let mockQb: any;

  beforeEach(() => {
    mockQb = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn()
    };
    mockRepo = { createQueryBuilder: jest.fn().mockReturnValue(mockQb) };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

    controller = new LoginController();
  });

  it('throws if no email provided', async () => {
    const req = { body: { password: 'pass' } } as any;
    const res = {} as any;
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it('throws if no password provided', async () => {
    const req = { body: { email: 'test@test.com' } } as any;
    const res = {} as any;
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it('throws if user not found', async () => {
    mockQb.getOne.mockResolvedValue(null);
    const req = { body: { email: 'test@test.com', password: 'pass' } } as any;
    const res = {} as any;
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it('throws if password incorrect', async () => {
    const fakeUser = new User();
    fakeUser.email = 'test@test.com';
    fakeUser.password = 'hashed';
    fakeUser.salt = 'salt';
    mockQb.getOne.mockResolvedValue(fakeUser);
    (PasswordHandler.verifyPassword as jest.Mock).mockReturnValue(false);

    const req = { body: { email: 'test@test.com', password: 'wrong' } } as any;
    const res = {} as any;
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it('returns token when credentials are correct', async () => {
    const fakeUser = new User();
    fakeUser.email = 'test@test.com';
    fakeUser.password = 'hashed';
    fakeUser.salt = 'salt';
    fakeUser.role = { id: 1, name: 'Admin' } as any;
    mockQb.getOne.mockResolvedValue(fakeUser);
    (PasswordHandler.verifyPassword as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('signed-token');

    const req = { body: { email: 'test@test.com', password: 'pass' } } as any;
    const send = jest.fn();
    const status = jest.fn().mockReturnValue({ send });
    const res = { status } as any;

    await controller.login(req, res);

    expect(status).toHaveBeenCalledWith(202);
    expect(send).toHaveBeenCalledWith('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { token: expect.any(Object) },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );
  });
});
