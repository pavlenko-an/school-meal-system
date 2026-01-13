export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string | Record<string, any>;
}
