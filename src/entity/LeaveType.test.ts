import { validate } from 'class-validator';
import { LeaveType } from './LeaveType';

describe('LeaveType entity tests', () => {
  it('rejects a blank name', async () => {
    const lt = new LeaveType();
    lt.name            = '';                 
    lt.description     = 'Some desc';
    lt.initialBalance  = 10;                   
    lt.maxRollOverDays = 5;

    const errors = await validate(lt);
    expect(errors.length).toBeGreaterThan(0);

    const nameError = errors.find(e => e.property === 'name')!;
    expect(nameError.constraints).toHaveProperty('length');
  });

  it('rejects a name longer than 50 chars', async () => {
    const lt = new LeaveType();
    lt.name            = 'a'.repeat(51);    
    lt.description     = 'Some desc';
    lt.initialBalance  = 10;
    lt.maxRollOverDays = 5;

    const errors = await validate(lt);
    expect(errors.length).toBeGreaterThan(0);

    const nameError = errors.find(e => e.property === 'name')!;
    expect(nameError.constraints).toHaveProperty('length');
  });

  it('accepts a valid name, description, and numbers', async () => {
    const lt = new LeaveType();
    lt.name            = 'Vacation';
    lt.description     = 'Annual leave';
    lt.initialBalance  = 20;
    lt.maxRollOverDays = 10;

    const errors = await validate(lt);
    expect(errors.length).toBe(0);
  });
});

