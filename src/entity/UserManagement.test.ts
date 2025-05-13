import { validate } from 'class-validator';
import { UserManagement } from './UserManagement';

describe('UserManagement entity tests', () => {
  it('invalid when userId or managerId are missing', async () => {
    const um = new UserManagement();
    um.startDate = new Date('2025-05-01');
    um.endDate   = new Date('2025-05-02');

    const errors = await validate(um);
    expect(errors.length).toBeGreaterThan(0);
    const props = errors.map(e => e.property);
    expect(props).toEqual(
      expect.arrayContaining(['userId', 'managerId'])
    );
  });

  it('invalid when dates are not Date objects', async () => {
    const um = new UserManagement();
    um.userId    = 1;
    um.managerId = 2;
    um.startDate = 'bad-date' as any;
    um.endDate   = 'also-bad' as any;

    const errors = await validate(um);
    expect(errors.length).toBeGreaterThan(0);
    const props = errors.map(e => e.property);
    expect(props).toEqual(
      expect.arrayContaining(['startDate', 'endDate'])
    );
  });

  it('valid when all fields are correct', async () => {
    const um = new UserManagement();
    um.userId    = 1;
    um.managerId = 2;
    um.startDate = new Date('2025-05-01');
    um.endDate   = new Date('2025-05-02');

    const errors = await validate(um);
    expect(errors.length).toBe(0);
  });
});
