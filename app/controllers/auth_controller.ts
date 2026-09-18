import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * POST /register
   * Mendaftar sebagai admin / user
   */
  async register({ request, response }: HttpContext) {
    const payload = request.only(['name', 'email', 'password', 'role'])

    if (!payload.name || !payload.email || !payload.password) {
      return response.status(400).json({
        message: 'Name, email, dan password wajib diisi',
      })
    }

    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.status(400).json({
        message: 'Email sudah terdaftar',
      })
    }

    // Role hanya boleh 'admin' atau 'user', default: 'user'
    const role = payload.role === 'admin' ? 'admin' : 'user'

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: role,
    })

    return response.status(201).json({
      message: 'Registrasi berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }

  /**
   * POST /login
   * Login untuk mendapatkan token JWT / Access Token
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    if (!email || !password) {
      return response.status(400).json({
        message: 'Email dan password wajib diisi',
      })
    }

    const user = await User.verifyCredentials(email, password)
    if (!user) {
      return response.status(401).json({
        message: 'Email atau password salah',
      })
    }

    const token = await User.accessTokens.create(user)

    return response.json({
      message: 'Login berhasil',
      token: token.value!.release(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }
}