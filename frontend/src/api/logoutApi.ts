import request, { requestOptions } from '../utils/request';

export async function logoutApi() {

	const requestParams: requestOptions = {
		url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/logout`,
		method: 'POST',
	};

	try {
		const response = await request(requestParams);

		if (response.error) return { data: null as null, success: false, error: response.message };
		return { data: response.data, success: true, error: null as null };

	} catch (error) {
		return { data: null as null, success: false, error: "logoutApi : Um erro inesperado aconteceu" };
	}
}




