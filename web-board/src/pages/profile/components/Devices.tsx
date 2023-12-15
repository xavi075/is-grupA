import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { IUserDevices } from '../../../utils/interfaces';
import { getUserDevices, getAvailableDevices} from '../../../utils/api';
import { Link } from "react-router-dom";
import './Devices.css'


const Devices =  () => {
  const { usernameId } = useUser();
  const [NewDevice, setNewDevice] = useState(false);
  const [UserDevices, setUserDevices] = useState<IUserDevices>();
  const [AvailableDevices, setAvailableDevices] = useState<IUserDevices>();

  const toggleNewDevice = () => {
    setNewDevice(!NewDevice);
  };

  const addNewDevice = () => {
    // TO-DO: Petició Nou dispositiu
  }

  const DeleteDevice = (dispositiuId: number) => {
    // TO-DO: Afegeix nou dispositiu
  }

  useEffect(() => {
    if (usernameId != null){
      getUserDevices(usernameId)
        .then((response) => {
          setUserDevices(response)
        })
        .catch((error) => {
          console.error('Error when obtaining branches (Username or password incorrect): ', error);
        });
      if (NewDevice) {
        getAvailableDevices()
        .then((response) => {
          setAvailableDevices(response)
        })
        .catch((error) => {
          console.error('Available devices error: ', error);
        });
      }
    }
  }, [])

  return(
    <div className="account-box">
      <h2>Els meus dispositius</h2>
      <div className="device-list">
        {UserDevices?.dades.map((dispositiu) => (
          <div key={`grup-${dispositiu.nomDispositiu}`} className="device-item">
            <div className="device-details">
              <strong className='dev-name'>{dispositiu.nomDispositiu}</strong> 
              <br />
              <strong>Llindar mínim:</strong> {dispositiu.llindarMinimReg}%
              <br />
              <strong>Llindar màxim:</strong> {dispositiu.llindarMaximReg}%
            </div>
            <div className="device-actions">
              <Link className="logout-link" to="#" onClick={() => DeleteDevice(dispositiu.id)}>
                Elimina'l
              </Link>
            </div>
          </div>
        ))}
  </div>
      {!NewDevice ? <Link className="add-device-link" to="#" onClick={toggleNewDevice}>Afegeix un nou dispositiu </Link>
      :
      <div className="available-devices-box"> 
      <h2>Dispositius disponibles</h2>
      {/* TO-DO: Dissenyar gestió de nous devices */}
      <table className='table-info'>
        <tbody>
        {AvailableDevices?.dades.map((dispositiu) => (
          <tr>
          <td>{dispositiu.id}</td>
          <td><Link className="logout-link" to="#" onClick={addNewDevice}>Afegeix</Link></td>
          {/* <td>{dispositiu.dataHora.toDateString()}</td> */}
        </tr>
        ))}
           <tr>
             <td>Temperatura</td>
             <td><Link className="logout-link" to="#" onClick={addNewDevice}>Afegeix</Link></td>
             {/* <td>{dispositiu.dadaTemp}</td> */}
           </tr>
           <tr>
             <td>Humitat</td>
             <td><Link className="logout-link" to="#" onClick={addNewDevice}>Afegeix</Link></td>
             {/* <td>{dispositiu.dadaHum}</td> */}
           </tr>
         </tbody>
         </table>
      <Link className="logout-link" to="#" onClick={toggleNewDevice}>Cancel·la </Link>
      </div>
      }
      
    </div>
  )
}
export default Devices;