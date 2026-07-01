import { Router } from 'express'
import { getButacas } from '../controllers/showtimes.controller'

const router = Router()

router.get('/:showtimeId/butacas', getButacas)

export default router
