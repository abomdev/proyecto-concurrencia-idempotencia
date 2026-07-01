import { Router } from 'express'
import { getPeliculas, getPelicula, getFuncionesPorPelicula } from '../controllers/movies.controller'

const router = Router()

router.get('/', getPeliculas)
router.get('/:id', getPelicula)
router.get('/:id/funciones', getFuncionesPorPelicula)

export default router
