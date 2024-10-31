import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  // PRODUCT_MICROSERVICES_HOST: string;
  // PRODUCT_MICROSERVICES_PORT: number;
  NATS_SERVERS: Array<string>;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    // PRODUCT_MICROSERVICES_HOST: joi.string().required(),
    // PRODUCT_MICROSERVICES_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { value, error } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error('VARIABLES DE ENTORNO INVALIDAS O INCOMPLETAS');
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  // productsMicroserviceHost: envVars.PRODUCT_MICROSERVICES_HOST,
  // productsMicroservicePort: envVars.PRODUCT_MICROSERVICES_PORT,
  natsServers: envVars.NATS_SERVERS,
  // database_url: envVars.DATABASE_URL,
};
