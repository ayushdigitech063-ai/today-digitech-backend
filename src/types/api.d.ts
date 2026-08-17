export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiResponse<T = any> {
    success: true;
    message: string;
    data: T;
    meta?: PaginationMeta | Record<string, any>;
    timestamp: string;
}
export interface ApiErrorDetail {
    field?: string;
    message: string;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    errorCode?: string;
    errors?: ApiErrorDetail[];
    timestamp: string;
    stack?: string;
}
//# sourceMappingURL=api.d.ts.map