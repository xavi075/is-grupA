import { ILogged } from "./interfaces";

const ENDPOINT = 'http://localhost:8000';

const headers = {
    'Content-Type': 'application/json'
  };

export default function login(username:string, password: string): Promise<ILogged> {
  
    // return axios.get<ILogged>(`${ENDPOINT}/login`, { headers })
    //   .then((response) => response.data)
    //   .catch((error) => {
    //     throw new Error(`Error when obtaining project information: ${error}`);
    //   });
    return fetch(`${ENDPOINT}/login`, {
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
