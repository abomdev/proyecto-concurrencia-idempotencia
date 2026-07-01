import { Router } from 'express'
import { createReserva, confirmReserva } from '../controllers/booking.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { idempotencyMiddleware } from '../middleware/idempotency.middleware'

const router = Router()

router.post('/', verifyToken, idempotencyMiddleware, createReserva)
router.post('/:codigoReserva/confirmar', verifyToken, confirmReserva)

export default router
