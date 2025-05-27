export interface ApiResult<T = null> {
  message: string;
  statusCode: number;
  result?: T;
}
