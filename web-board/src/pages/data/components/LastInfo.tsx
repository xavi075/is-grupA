import { useState, useEffect} from 'react';
import { ILastInfo } from '../../../utils/interfaces';
import { getLastWaterInfo } from '../../../utils/api';
import { IUserDevices } from '../../../utils/interfaces';
import { useUser } from '../../../context/UserContext';
import './LastInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { convertDate } from '../../../utils/functions';


const LastInfo = (props: {deviceId: number, finalData: string, startingData: string}) => {
  return (
    <div className="table-container">
      <h3>Dispositiu {props.deviceId}</h3>
      <table className='table-info'>
        <tbody>
          <tr>
            <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora d'inici</td>
            <td>{convertDate(props.startingData)}</td>
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="seedling" style={{ color: "#007ABF" }} /> Final de reg</td>
            {(props.finalData == "")?
            <td>Regant</td>
            :
            <td>{convertDate(props.finalData)}</td>
            }
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="stopwatch" style={{ color: "#007ABF" }} /> Temps total</td>
            {(props.finalData == "")?
            <td>-</td>
            :
            <td>TO-DO: Càlcul temps</td>
            }
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LastInfo;
