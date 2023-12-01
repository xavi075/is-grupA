import { ILogged } from "./interfaces";

const ENDPOINT = 'http://localhost:8000';

const headers = {
    'Content-Type': 'application/json'
  };

export function loginRequest(username:string, password: string): Promise<ILogged> {
  
  // return axios.get<ILogged>(`${ENDPOINT}/login`, { headers })
  //   .then((response) => response.data)
  //   .catch((error) => {
  //     throw new Error(`Error when obtaining project information: ${error}`);
  //   });
  return fetch(`${ENDPOINT}/validarLogin`, {
      method: 'POST',
      headers: {
          "Content-type": "aplication/json"
      },
      body: JSON.stringify({username, password})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}

export function changePwdRequest(usernameId:string, newPassword: string): Promise<ILogged> {
  //TO-DO: Assegurar destí de la request al servidor
  return fetch(`${ENDPOINT}/canviarContrassenya`, {
      method: 'POST',
      headers: {
          "Content-type": "aplication/json"
      },
      body: JSON.stringify({usernameId, newPassword})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}
