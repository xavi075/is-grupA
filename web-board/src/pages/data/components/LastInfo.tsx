import { useState, useEffect} from 'react';
import { ILastInfo } from '../../../utils/interfaces';
import { getLastWaterInfo } from '../../../utils/api';
import { IUserDevices } from '../../../utils/interfaces';
import { useUser } from '../../../context/UserContext';
import './LastInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const LastInfo = (props: {deviceId: number | undefined}) => {
  const { usernameId } = useUser();
  const [lastInfo, setLastInfo] = useState<ILastInfo>();

  useEffect(() => {
    if (props.deviceId != undefined){
      getLastWaterInfo(props.deviceId)
      .then((response) => {
          setLastInfo(response)
      })
      .catch((error) => {
          console.error('Error when Lat Water info: ', error);
      });
    }
    }, [])

  return (
    // <div>
    //   {lastInfo?.dades.map((dispositiu) => (
    //     <div className="table-container">
    //     <h2>Informació de l'últim reg del dispositiu {dispositiu.idDispositiu}</h2>
    //     <table className='table-info'>
    //     <tbody>
    //       <tr>
    //         <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora</td>
    //         <td>14:00h</td>
    //         <td>{dispositiu.dataHora.toDateString()}</td>
    //       </tr>
    //       <tr>
    //         <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Temperatura</td>
    //         <td>26ºC</td>
    //         <td>{dispositiu.dadaTemp}</td>
    //       </tr>
    //       <tr>
    //         <td><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Humitat</td>
    //         <td>56%</td>
    //         <td>{dispositiu.dadaHum}</td>
    //       </tr>
    //     </tbody>
    //     </table>
    //     </div>
    //   ))}   
    // </div>
    <div className="table-container">
         {/* <h2>Informació de l'últim reg del dispositiu {dispositiu.idDispositiu}</h2> */}
         <h3>Dispositiu {props.deviceId}</h3>
         <table className='table-info'>
         <tbody>
           <tr>
             <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora d'inici</td>
             <td>{lastInfo?.dades[0].dataHoraInici}</td>
             {/* <td>{dispositiu.dataHora.toDateString()}</td> */}
           </tr>
           <tr>
             <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Hora de final</td>
             <td>{lastInfo?.dades[0].dataHoraFi}</td>
             {/* <td>{dispositiu.dadaTemp}</td> */}
           </tr>
           <tr>
             <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Temps total regant</td>
             <td>{lastInfo?.dades[0].dataHoraFi}</td>
             {/* <td>{dispositiu.dadaTemp}</td> */}
           </tr>
         </tbody>
         </table>
         </div>

  );
};

export default LastInfo;
