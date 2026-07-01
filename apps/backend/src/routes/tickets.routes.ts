import { Router } from 'express'
import { getMisTickets } from '../controllers/tickets.controller'
import { verifyToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/', verifyToken, getMisTickets)

export default router
