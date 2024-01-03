import { useState, useEffect} from 'react';
import { ILastInfo } from '../../../utils/interfaces';
import { getLastWaterInfo } from '../../../utils/api';
import { IUserDevices } from '../../../utils/interfaces';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { convertDate } from '../../../utils/functions';


const LastMeasure = (props: {nomDispositiu: string, dadaHum: number, dadaTemp: number, dataHora: string}) => {
  return (
    <div className="table-container">
      <h3>Dispositiu {props.nomDispositiu}</h3>
      <table className='table-info'>
        <tbody>
          <tr>
            <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Data i hora</td>
            <td>{convertDate(props.dataHora)}</td>
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Humitat</td>
            <td>{props.dadaHum}</td>
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="temperature-half" style={{ color: "#007ABF" }} /> Temperatura</td>
            <td>{props.dadaTemp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LastMeasure;
