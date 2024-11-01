import request, { requestOptions } from '../utils/request';

export async function loginApi({ email, password }: { email: string, password: string }) {
    const body = {
        email,
        password,
    }


    const requestParams: requestOptions = {
        url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/login`,
        method: 'POST',
        body: body,
    };

    try {
        const response = await request(requestParams);

        if (response.error) return { data: null as null, success: false, error: response.message };
        return { data: response.data, success: true, error: null as null };

    } catch (error) {
        return { data: null as null, success: false, error: "loginApi : Um erro inesperado aconteceu" };
    }
}




