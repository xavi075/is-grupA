import { useState, useEffect} from 'react';
import { ILastInfo } from '../../../utils/interfaces';
import { getLastInfo } from '../../../utils/api';
import { useUser } from '../../../context/UserContext';
import './LastInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const LastInfo = () => {
  const { usernameId } = useUser();
  const [lastInfo, setLastInfo] = useState<ILastInfo>();

  useEffect(() => {
    if (usernameId != null){
      getLastInfo(usernameId)
        .then((response) => {
          setLastInfo(response)
          // TO-DO: formatting time
        })
        .catch((error) => {
          console.error('Error when obtaining branches (Username or password incorrect): ', error);
        });
    }
  })

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
         <h2>Info ultim reg</h2>
         <table className='table-info'>
         <tbody>
           <tr>
             <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora</td>
             <td>14:00h</td>
             {/* <td>{dispositiu.dataHora.toDateString()}</td> */}
           </tr>
           <tr>
             <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Temperatura</td>
             <td>26ºC</td>
             {/* <td>{dispositiu.dadaTemp}</td> */}
           </tr>
           <tr>
             <td><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Humitat</td>
             <td>56%</td>
             {/* <td>{dispositiu.dadaHum}</td> */}
           </tr>
         </tbody>
         </table>
         </div>

  );
};

export default LastInfo;
