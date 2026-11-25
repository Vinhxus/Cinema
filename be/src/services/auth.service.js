import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import * as authRepository from '../repositories/auth.repository.js';

function signToken(user) {
  return jwt.sign(
    {
      userId: user.UserID,
      UserID: user.UserID,
      mail: user.mail,
      role: user.UserType,
      UserType: user.UserType,
    },
    process.env.JWT_SECRET || 'cinema_secret_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

export async function register(data) {
  const mail = data.mail || data.email;
  const phoneNumber = data.phone_number ?? data.phone ?? null;

  const existingByEmail = await authRepository.findByEmail(mail);
  if (existingByEmail) {
    throw new AppError('Email already exists', 409);
  }

  if (phoneNumber) {
    const existingByPhone = await authRepository.findByPhone(phoneNumber);
    if (existingByPhone) {
      throw new AppError('Phone number already exists', 409);
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await authRepository.createUser({
    name: data.name,
    phone_number: phoneNumber,
    mail,
    hashed_password: hashedPassword,
    UserType: 'CUSTOMER',
    birthdate: data.birthdate ?? null,
  });

  const token = signToken(user);

  return {
    token,
    role: user.UserType,
    user,
  };
}

export async function login(data) {
  const identifier = data.mail || data.email || data.identifier;
  const userRow = await authRepository.findByIdentifier(identifier);

  if (!userRow) {
    throw new AppError('Invalid email/phone or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    userRow.hashed_password
  );

  if (!isPasswordValid) {
    throw new AppError('Invalid email/phone or password', 401);
  }

  const { hashed_password: _, ...user } = userRow;
  const token = signToken(user);

  return {
    token,
    role: user.UserType,
    user,
  };
}

