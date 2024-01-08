import { ILogged, ILastInfo, IUserDevices, IRegister, IData, IAvailableDevices, IWaterChanges } from "./interfaces";

const ENDPOINT = 'https://api.is.ferrancasanovas.cat';

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

export function getLastWaterInfo (usernameId: string): Promise<ILastInfo> {
    return fetch(`${ENDPOINT}/obtenirUltimRegUsuari?idUsuari=${usernameId}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
        },
    }).then(res => {
        if (!res.ok) throw new Error('Response of get last water info is not OK')
        return res.json()
    }).then( res => {
        return res 
    })
}

export function getLastMeasure (usernameId: string): Promise<IData> {
    return fetch(`${ENDPOINT}/obtenirUltimaDadaDispositiu?idUsuari=${usernameId}`, {
        method: 'GET',
        headers: {
            "Content-type": "application/json"
        },
    }).then(res => {
        if (!res.ok) throw new Error('Response of get last water info is not OK')
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

export function getAvailableDevices (): Promise<IAvailableDevices> {
  return fetch(`${ENDPOINT}/obtenirDispositiusDesassignats`, {
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

export function getDeviceInfo (deviceId: number): Promise<IUserDevices> {
    return fetch(`${ENDPOINT}/obtenirDispositius?idDispositiu=${deviceId}`, {
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

export function assignDeviceUser (idDispositiu: number, idUsuari: string, nomDispositiu:string ): Promise<IUserDevices> {
  return fetch(`${ENDPOINT}/assignaDispositiuUsuari`, {
      method: 'POST',
      headers: {
          "Content-type": "application/json"
      },
      body: JSON.stringify({idDispositiu, idUsuari, nomDispositiu})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}

export function insertThreshold (idDispositiu: number, llindarMinimReg: number, llindarMaximReg: number): Promise<IUserDevices> {
return fetch(`${ENDPOINT}/modificaLlindars`, {
    method: 'POST',
    headers: {
        "Content-type": "application/json"
    },
    body: JSON.stringify({idDispositiu, llindarMinimReg, llindarMaximReg})
}).then(res => {
    if (!res.ok) throw new Error('Response is not OK')
    return res.json()
}).then( res => {
    return res 
})
}

export function deleteDeviceUser (idDispositiu: number, idUsuari: string): Promise<IUserDevices> {
  return fetch(`${ENDPOINT}/desassignaDispositiu`, {
      method: 'POST',
      headers: {
          "Content-type": "application/json"
      },
      body: JSON.stringify({idDispositiu, idUsuari})
  }).then(res => {
      if (!res.ok) throw new Error('Response is not OK')
      return res.json()
  }).then( res => {
      return res 
  })
}

export function getDeviceData (deviceId: number, startDate:string, finalDate:string): Promise<IData> {

  if (startDate === "" || finalDate === ""){
    return fetch(`${ENDPOINT}/obtenirDadesDispositius?idDispositiu=${deviceId}`, {
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
  } else {
    return fetch(`${ENDPOINT}/obtenirDadesDispositius?idDispositiu=${deviceId}&dataInici=${startDate}&dataFi=${finalDate}`, {
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
}

export function getWaterChanges (deviceId: number, startDate:string, finalDate:string): Promise<IWaterChanges> {

  if (startDate === "" || finalDate === ""){
    return fetch(`${ENDPOINT}/obtenirCanvisReg?idDispositiu=${deviceId}`, {
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
  } else {
    return fetch(`${ENDPOINT}/obtenirCanvisReg?idDispositiu=${deviceId}&dataInici=${startDate}&dataFi=${finalDate}`, {
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
}

