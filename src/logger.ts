import winston, {format} from 'winston';

export const logger = winston.createLogger({
  level: 'silly',
  format: format.cli(),
  transports: [
    new winston.transports.Console(),
  ],
});
