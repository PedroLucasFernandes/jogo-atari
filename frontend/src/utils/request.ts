export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface requestOptions {
    url: string;
    method: HTTPMethod;
    body?: object | FormData;
    formData?: boolean;
    headers?: { [key: string]: string };
    auth?: boolean;
    socketId?: string;
}

export default async function request<T>({
    url,
    method,
    body,
    formData,
    auth = true,
    socketId,
}: requestOptions): Promise<{
    data: T;
    error: boolean;
    success: boolean;
    status: number;
    message?: string | string[];
}> {

    const requestOptions: RequestInit = {
        method,
        body: !formData ? JSON.stringify(body) : (body as FormData),
        headers: {
            ...(!formData ? { "Content-type": "application/json" } : {}),
            ...(socketId ? { "x-socket-id": socketId } : {}),
        },
        cache: "no-store",
        credentials: 'include',

    };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return {
        data: data.data,
        error: !response.ok,
        success: data.success,
        status: response.status,
        message: data.message ? data.message : null,
    };
}