import { Response, NextFunction } from 'express'
import { IdempotencyKey } from '../models/IdempotencyKey'
import { AuthRequest } from './auth.middleware'

export async function idempotencyMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const key = req.headers['idempotency-key'] as string | undefined

  if (!key) {
    next()
    return
  }

  const userId = req.userId!
  const endpoint = req.path

  const cached = await IdempotencyKey.findOne({ key, userId, endpoint }).lean()
  if (cached) {
    res.status(cached.statusCode).json(cached.responseBody)
    return
  }

  // Intercepta res.json para guardar la respuesta antes de enviarla
  const originalJson = res.json.bind(res)
  res.json = (body: unknown) => {
    IdempotencyKey.create({
      key,
      userId,
      endpoint,
      statusCode: res.statusCode,
      responseBody: body,
    }).catch(() => {})
    return originalJson(body)
  }

  next()
}
