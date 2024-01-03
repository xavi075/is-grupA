// export interface ILogged {
//   credencialsTrobades: boolean
//   idUsuari: number | null
//   success: boolean
// }

// export interface IRegister {
//   success: boolean
//   idUsuariInsertat: number | null
// }

// export interface IChangedPwd {
//   success: boolean
// }

// export interface ILastInfo {
//   dades: Array<{
//     dataHoraFi: string
//     dataHoraInici: string
//   }>,
//   success: boolean,
// }

// export interface IUserDevices {
//   success: boolean,
//   dades: Array<{
//     id: number
//     nomDispositiu: string
//     llindarMinimReg: number
//     llindarMaximReg: number
//   }>
// }

// export interface IData {
//   success: boolean,
//   dades: Array<{
//     idDispositiu: number
//     dataHora: string
//     dadaHum: number
//     dadaTemp: number
//     // TO-DO: Confirmar nom de dada temp
//   }>
// }

export interface ILogged {
  credencialsTrobades: boolean
  idUsuari: number | null
  success: boolean
}

export interface IRegister {
  success: boolean
  idUsuariInsertat: number | null
}

export interface IChangedPwd {
  success: boolean
}

export interface ILastInfo {
  dades: Array<{
    dataHoraFi: string
    dataHoraInici: string
    idDispositiu: number
  }>,
  success: boolean,
}

export interface IUserDevices {
  success: boolean,
  dades: Array<{
    id: number
    nomDispositiu: string
    llindarMinimReg: number
    llindarMaximReg: number
  }>
}

export interface IAvailableDevices {
  dades: Array<{
    idDispositiu: number
    idHardcode: string
  }>,
  success: boolean
}

export interface IData {
  success: boolean,
  dades: Array<{
    idDispositiu: number
    nomDispositiu: string
    dataHora: string
    dadaHum: number
    dadaTemp: number
    // TO-DO: Confirmar nom de dada temp
  }>
}