import { validate } from 'class-validator';
import { LeaveRequest, LeaveStatus } from './LeaveRequest';

describe('LeaveRequest entity tests', () => {
  it('invalid when startDate or endDate are not Date objects', async () => {
    const lr = new LeaveRequest();
    lr.userId = 1;
    lr.leaveTypeId = 1;
    lr.startDate = 'not-a-date' as any;
    lr.endDate = 'also-bad' as any;
    lr.status = LeaveStatus.Pending;
    lr.reason = 'Valid reason';

    const errors = await validate(lr);
    expect(errors.length).toBeGreaterThan(0);
    const props = errors.map(e => e.property);
    expect(props).toEqual(expect.arrayContaining(['startDate', 'endDate']));
    const dateError = errors.find(e => e.property === 'startDate');
    expect(dateError?.constraints?.isDate).toBeDefined();
  });

  it('invalid when status is not a valid enum value', async () => {
    const lr = new LeaveRequest();
    lr.userId = 1;
    lr.leaveTypeId = 2;
    lr.startDate = new Date('2025-05-01');
    lr.endDate = new Date('2025-05-10');
    lr.status = 'NotAStatus' as any;
    lr.reason = 'Reason text';

    const errors = await validate(lr);
    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find(e => e.property === 'status');
    expect(statusError?.constraints?.isEnum).toBeDefined();
  });

  it('invalid when reason exceeds 500 characters', async () => {
    const lr = new LeaveRequest();
    lr.userId = 1;
    lr.leaveTypeId = 3;
    lr.startDate = new Date('2025-05-01');
    lr.endDate = new Date('2025-05-10');
    lr.status = LeaveStatus.Approved;
    lr.reason = 'a'.repeat(501);

    const errors = await validate(lr);
    expect(errors.length).toBeGreaterThan(0);
    const reasonError = errors.find(e => e.property === 'reason');
    expect(reasonError?.constraints?.length).toBeDefined();
  });

  it('valid when all fields are correct', async () => {
    const lr = new LeaveRequest();
    lr.userId = 42;
    lr.leaveTypeId = 7;
    lr.startDate = new Date('2025-05-01');
    lr.endDate = new Date('2025-05-10');
    lr.status = LeaveStatus.Pending;
    lr.reason = '';

    const errors = await validate(lr);
    expect(errors.length).toBe(0);
  });
});
