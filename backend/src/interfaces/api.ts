export interface IAPIResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}