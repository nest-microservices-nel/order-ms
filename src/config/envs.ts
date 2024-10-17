import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  // DATABASE_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    // DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { value, error } = envSchema.validate(process.env);

if (error) {
  throw new Error('VARIABLES DE ENTORNO INVALIDAS O INCOMPLETAS');
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  // database_url: envVars.DATABASE_URL,
};
