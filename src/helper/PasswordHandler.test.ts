process.env.PASSWORD_PEPPER = 'testPepper';

import { PasswordHandler } from './PasswordHandler';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

describe('PasswordHandler', () => {
  const plainPassword = 'mySecret123!';

  it('hashPassword returns a salt of correct length and a hashedPassword', () => {
    const { salt, hashedPassword } = PasswordHandler.hashPassword(plainPassword);

    expect(typeof salt).toBe('string');
    expect(salt).toHaveLength(16 * 2);

    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).toHaveLength(64 * 2);

    const second = PasswordHandler.hashPassword(plainPassword);
    expect(second.salt).not.toEqual(salt);
    expect(second.hashedPassword).not.toEqual(hashedPassword);
  });

  it('verifyPassword returns true for the correct password', () => {
    const { salt, hashedPassword } = PasswordHandler.hashPassword(plainPassword);
    const result = PasswordHandler.verifyPassword(plainPassword, hashedPassword, salt);
    expect(result).toBe(true);
  });

  it('verifyPassword returns false for an incorrect password', () => {
    const { salt, hashedPassword } = PasswordHandler.hashPassword(plainPassword);
    const result = PasswordHandler.verifyPassword('wrongPassword', hashedPassword, salt);
    expect(result).toBe(false);
  });
});
