import request, { requestOptions } from '../utils/request';

type ApiResponseError = string | string[] | undefined; 

interface ApiResponse {
	data?: any;
	error?: string | string[] | undefined; 
	message?: string | string[] | null; 
	status?: number;
  }
  


export async function registerApi({ username, email, password }: {
  username: string, email: string, password: string
}) {
  const body = { username, email, password };

  const requestParams: requestOptions = {
    url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/users`,
    method: 'POST',
    body: body,
  };

  try {
    const response: ApiResponse = await request(requestParams);

    if (response.error) {
      const errorMessage = Array.isArray(response.error)
        ? response.error.join(', ') 
        : response.error;  

      return { data: null as null, success: false, error: errorMessage };
    }

    return { data: response.data, success: true, error: null };

  } catch (error) {
    return { data: null as null, success: false, error: "registerApi : Um erro inesperado aconteceu" };
  }
}

// Função de login
export async function loginApi({ email, password }: { email: string, password: string }) {
  const body = { email, password };

  const requestParams: requestOptions = {
    url: `${process.env.REACT_APP_BACKEND_API_ADDRESS}/login`,
    method: 'POST',
    body: body,
  };

  try {
    const response: ApiResponse = await request(requestParams);
    console.log('Resposta da API:', response); 

    if (response.error) {
      const errorMessage = Array.isArray(response.error)
        ? response.error.join(', ')  
        : response.error;        

      return { data: null as null, success: false, error: errorMessage };
    }


    return { data: response.data, success: true, error: null };

  } catch (error) {
    console.error('Erro ao conectar à API:', error);
    return { data: null as null, success: false, error: "Erro ao conectar à API. Tente novamente mais tarde." };
  }
}
