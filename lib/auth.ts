import jwt from 'jsonwebtoken';
import { JWTPayload, User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this';

// 🔹 Generate JWT Token
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    role: user.role,
    department: user.department
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  });
}

// 🔹 Verify JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 🔹 Extract token from header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// 🔹 Check if user is admin or superadmin
export function isAdmin(payload: JWTPayload): boolean {
  return payload.role === 'admin' || payload.role === 'superadmin';
}

// 🔹 Check if user is CR
export function isCR(payload: JWTPayload): boolean {
  return payload.role === 'cr';
}

// 🔹 Check if user is super admin
export function isSuperAdmin(payload: JWTPayload): boolean {
  return payload.role === 'superadmin';
}

// 🔹 Check if user can manage all schedules
export function canManageAllSchedules(payload: JWTPayload): boolean {
  return payload.role === 'admin' || payload.role === 'superadmin';
}

