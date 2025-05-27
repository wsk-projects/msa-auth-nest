import { Request } from 'express';

export const requestUtil = {
  getIp: (req: Request): string => {
    return req.ip?.replace('::ffff:', '') ?? '';
  },
  getUserAgent: (req: Request): string => {
    return req.headers['user-agent'] ?? '';
  },
};
