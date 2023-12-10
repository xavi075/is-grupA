export interface ILogged {
  credencialsTrobades: boolean
  idUsuari: number | null
  success: boolean
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
  dispositius: Array<{
    idDispositiu: number
  }>
}