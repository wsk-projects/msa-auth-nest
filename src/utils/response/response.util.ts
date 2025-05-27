import { ApiResult } from './types/api-result.interface';

export const responseUtil = {
  success: <T>(result?: T): ApiResult<T> => ({
    message: 'Success',
    statusCode: 200,
    result: result ?? undefined,
  }),
};
