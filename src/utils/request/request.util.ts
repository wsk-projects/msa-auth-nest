import { Request } from 'express';

export const requestUtil = {
  getIp: (req: Request) => {
    return req.ip?.replace('::ffff:', '');
  },
  getUserAgent: (req: Request) => {
    return req.headers['user-agent'];
  },
};
