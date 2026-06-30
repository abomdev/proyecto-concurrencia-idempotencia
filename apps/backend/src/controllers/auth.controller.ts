import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { env } from '../config/env'

export async function registro(req: Request, res: Response): Promise<void> {
  const { nombre, email, password } = req.body as {
    nombre?: string
    email?: string
    password?: string
  }

  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'Todos los campos son requeridos.' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ nombre, email, passwordHash })
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )
    res.status(201).json({
      token,
      user: { _id: user._id, nombre: user.nombre, email: user.email },
    })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: 'El email ya está registrado.' })
      return
    }
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son requeridos.' })
    return
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    res.status(401).json({ error: 'Credenciales incorrectas.' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash as string)
  if (!valid) {
    res.status(401).json({ error: 'Credenciales incorrectas.' })
    return
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  )
  res.status(200).json({
    token,
    user: { _id: user._id, nombre: user.nombre, email: user.email },
  })
}
