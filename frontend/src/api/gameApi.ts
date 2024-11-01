import request, { requestOptions } from '../utils/request';

export async function createRoom({ password }: { password: string }) {
	const body = {
		password,
	};

	const requestParams: requestOptions = {
		url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/game/create`,
		method: 'POST',
		body,
	};

	try {
		const response = await request(requestParams);

		if (response.error) return { data: null as null, success: false, error: response.message };
		return { data: response.data, success: true, error: null as null };

	} catch (error) {
		return { data: null as null, success: false, error: "createRoom : Um erro inesperado aconteceu" };
	}
}

export async function closeRoom({ roomId }: { roomId: string }) {
	const body = {
		roomId,
	}

	const requestParams: requestOptions = {
		url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/game/close`,
		method: 'POST',
		body,
	};

	try {
		const response = await request(requestParams);

		if (response.error) return { data: null as null, success: false, error: response.message };
		return { data: response.data, success: true, error: null as null };

	} catch (error) {
		return { data: null as null, success: false, error: "closeRoom : Um erro inesperado aconteceu" };
	}
}

export async function enterRoom({ password }: { password: string }) {
	const body = {
		password,
	}

	const requestParams: requestOptions = {
		url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/game/close`,
		method: 'POST',
		body,
	};

	try {
		const response = await request(requestParams);

		if (response.error) return { data: null as null, success: false, error: response.message };
		return { data: response.data, success: true, error: null as null };

	} catch (error) {
		return { data: null as null, success: false, error: "enterRoom : Um erro inesperado aconteceu" };
	}
}

export async function exitRoom({ roomId }: { roomId: string }) {
	const body = {
		roomId,
	}

	const requestParams: requestOptions = {
		url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/game/close`,
		method: 'POST',
		body,
	};

	try {
		const response = await request(requestParams);

		if (response.error) return { data: null as null, success: false, error: response.message };
		return { data: response.data, success: true, error: null as null };

	} catch (error) {
		return { data: null as null, success: false, error: "exitRoom : Um erro inesperado aconteceu" };
	}
}




