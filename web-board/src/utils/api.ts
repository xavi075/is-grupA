import { ILogged, ILastInfo, IUserDevices, IRegister } from "./interfaces";

const ENDPOINT = 'http://127.0.0.1:5000';

// const headers = {
//   'Content-Type': 'application/json'
// };

export function loginRequest(emailUsuari:string, contrasenya: string): Promise<ILogged> {
  return fetch(`${ENDPOINT}/verificaLogIn`, {
      method: 'POST',
      headers: {
          "Content-type": "application/json"
      },
      body: JSON.stringify({emailUsuari, contrasenya})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}

export function registerRequest(email:string, nomUsuari: string, contrasenya: string): Promise<IRegister> {
  return fetch(`${ENDPOINT}/inserirUsuari`, {
      method: 'POST',
      headers: {
          "Content-type": "application/json"
      },
      body: JSON.stringify({email, nomUsuari, contrasenya})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}



export function changePwdRequest(idUsuari:string, contrasenya:string, novaContrasenya: string): Promise<ILogged> {
  //TO-DO: Assegurar destí de la request al servidor
  return fetch(`${ENDPOINT}/modificaContrasenya`, {
      method: 'POST',
      headers: {
          "Content-type": "application/json"
      },
      body: JSON.stringify({idUsuari, contrasenya, novaContrasenya})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}

export function getLastInfo (usernameId: string): Promise<ILastInfo> {
    return fetch(`${ENDPOINT}/ENCARAPERDECIDIR/${usernameId}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
        },
    }).then(res => {
        if (!res.ok) throw new Error('Response is not OK')
        return res.json()
    }).then( res => {
        return res 
    })
}

export function getUserDevices (usernameId: string): Promise<IUserDevices> {
    return fetch(`${ENDPOINT}/obtenirDispositius?idUsuari=${usernameId}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
        },
    }).then(res => {
        if (!res.ok) throw new Error('Response is not OK')
        return res.json()
    }).then( res => {
        return res 
    })
}

export function getAvailableDevices (): Promise<IUserDevices> {
  return fetch(`${ENDPOINT}/obtenirDispositiusDesassignats/`, {
      method: 'GET',
      headers: {
          "Content-type": "application/json"
      },
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}
