export interface ILogged {
  credencialsTrobades: boolean
  idUsuari: number | null
  success: boolean
  usuariVerificat: boolean
}

export interface IRegister {
  success: boolean
  idUsuariInsertat: number | null
}

export interface IVerify {
  success: boolean
  usuariVerificat: boolean
}

export interface IChangedPwd {
  success: boolean
}

export interface ILastInfo {
  dades: Array<{
    dataHoraFi: string
    dataHoraInici: string
    idDispositiu: number
    nomDispositiu: string
  }>,
  success: boolean,
}

export interface IUserDevices {
  success: boolean,
  dades: Array<{
    id: number
    idHardcode: string
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
  }>
}

export interface IWaterChanges {
  success: boolean,
  dades: Array<{
    idDispositiu: number
    dataHora: string
    estatReg: boolean
  }>
}

export interface IProfile {
  success: boolean,
  dades: Array<{
    nomUsuari: string
    dataCreacioUsuari: string
  }>
}