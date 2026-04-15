import * as dotenv from 'dotenv';
import * as joi from 'joi';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env';
dotenv.config({ path: envFile });

const DEFAULT_PORT = 3000;

interface IEnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;

  // Prisma
  DATABASE_URL: string;

  // JWT
  AT_SECRET: string;
  RT_SECRET: string;

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Frontend
  FE_URL: string;

  // Cookie Parser
  COOKIE_KEY: string;

  // Correo
  EMAIL: string;
  EMAIL_KEY: string;
  SMTP_HOST: string;
  SMTP_PORT: number;

  // Planificador
  PLANIFICATOR_AI_HOST: string;
}

const envShchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: joi.string().default(DEFAULT_PORT),
    HOST: joi.string().default(`http://localhost:${DEFAULT_PORT}/v1/api`),

    // Prisma
    DATABASE_URL: joi.string().required(),

    // JWT
    AT_SECRET: joi.string().required(),
    RT_SECRET: joi.string().required(),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: joi.string().required(),
    CLOUDINARY_API_KEY: joi.string().required(),
    CLOUDINARY_API_SECRET: joi.string().required(),

    // Frontend
    FE_URL: joi.string().required(),

    // Cookie Parser
    COOKIE_KEY: joi.string().required(),

    // Correo
    EMAIL: joi.string().required(),
    EMAIL_KEY: joi.string().required(),
    SMTP_HOST: joi.string().required(),
    SMTP_PORT: joi.string().default(465),

    // Planificador
    PLANIFICATOR_AI_HOST: joi.string().required(),
  })
  .unknown(true);

const result = envShchema.validate(process.env);

if (result.error)
  throw new Error(`Config validation error: ${result.error.message}`);

const envVars = result.value as IEnvVars;

export const envs = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,

  // Prisma
  databaseUrl: envVars.DATABASE_URL,

  // JWT
  atSecret: envVars.AT_SECRET,
  rtSecret: envVars.RT_SECRET,

  // Cloudinary
  cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: envVars.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: envVars.CLOUDINARY_API_SECRET,

  // Frontend
  feUrl: envVars.FE_URL,

  // Cookie Parser
  cookieKey: envVars.COOKIE_KEY,

  // Correo
  email: envVars.EMAIL,
  emailKey: envVars.EMAIL_KEY,
  smtpHost: envVars.SMTP_HOST,
  smtpPort: envVars.SMTP_PORT,

  // Planificador
  planificatorAiHost: envVars.PLANIFICATOR_AI_HOST,
} as const;
