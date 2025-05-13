import { ResponseHandler } from './ResponseHandler';
import { StatusCodes } from 'http-status-codes';

describe('ResponseHandler', () => {
  let res: any;
  let send: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    send = jest.fn();
    status = jest.fn().mockReturnValue({ send });
    res = { status } as any;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sendSuccessResponse should call res.status with given code and send data', () => {
    const data = { foo: 'bar' };
    const code = StatusCodes.CREATED;

    const returned = ResponseHandler.sendSuccessResponse(res, data, code);

    expect(status).toHaveBeenCalledWith(code);
    expect(send).toHaveBeenCalledWith({ data });
    expect(returned).toEqual(res);
  });

  it('sendSuccessResponse defaults to 200 and empty object', () => {
    const returned = ResponseHandler.sendSuccessResponse(res);

    expect(status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(send).toHaveBeenCalledWith({ data: {} });
    expect(returned).toEqual(res);
  });

  it('sendErrorResponse should call res.status with given code and send error object', () => {
    const message = 'Test error';
    const code = StatusCodes.BAD_REQUEST;

    const returned = ResponseHandler.sendErrorResponse(res, code, message);

    expect(status).toHaveBeenCalledWith(code);
    const errorObj = send.mock.calls[0][0];
    expect(errorObj).toHaveProperty('error');
    expect(errorObj.error).toMatchObject({
      message,
      status: code,
    });
    expect(typeof errorObj.error.timestamp).toBe('string');
    expect(returned).toEqual(res);
  });

  it('sendErrorResponse defaults message when not provided', () => {
    const code = StatusCodes.INTERNAL_SERVER_ERROR;

    ResponseHandler.sendErrorResponse(res, code);

    const errorObj = send.mock.calls[0][0];
    expect(errorObj.error.message).toBe('Unexpected error');
  });
});
