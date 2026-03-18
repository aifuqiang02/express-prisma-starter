export type ApiSuccessResponse<T> = {
  code: 200;
  data: T;
  msg: string;
};

export type ApiErrorResponse = {
  code: number;
  data: null;
  msg: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
