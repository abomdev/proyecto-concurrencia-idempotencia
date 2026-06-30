import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  userId?: string
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido.' })
    return
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}
