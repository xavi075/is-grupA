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
  success: boolean,
  dades: Array<{
    idDispositiu: number,
    dataHora: Date,
    dadaHum: number,
    dadaTemp: number
  }>
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