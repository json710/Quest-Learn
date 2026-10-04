import 'dotenv/config'

const parseSaltRounds = () => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12)

  if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 15) {
    throw new Error('BCRYPT_SALT_ROUNDS must be an integer between 4 and 15')
  }

  return saltRounds
}

export const getEnvironment = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptSaltRounds: parseSaltRounds(),
})

export const validateEnvironment = () => {
  const env = getEnvironment()
  const missing = []

  if (!env.databaseUrl) missing.push('DATABASE_URL')
  if (!env.jwtSecret) missing.push('JWT_SECRET')

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }

  return Object.freeze(env)
}
