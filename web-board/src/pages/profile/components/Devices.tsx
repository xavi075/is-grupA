import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { IUserDevices, IAvailableDevices } from '../../../utils/interfaces';
import { getUserDevices, getAvailableDevices, assignDeviceUser, deleteDeviceUser} from '../../../utils/api';
import { Link } from "react-router-dom";
import './Devices.css'


const Devices =  () => {
  const { usernameId } = useUser();
  const [NewDevice, setNewDevice] = useState(false);
  const [AddNewDevice, setAddNewDevice] = useState(false);
  const [ContentChanged, setContentChanged] = useState(false);


  const [SelectedId, setSelectedId] = useState<number | undefined>();
  const [SelectedIdHardcode, setSelectedIdHardcode] = useState("");
  const [DeviceName, setDeviceName] = useState("");

  const [UserDevices, setUserDevices] = useState<IUserDevices>();
  const [AvailableDevices, setAvailableDevices] = useState<IAvailableDevices>();

  const toggleNewDevice = () => {
    setNewDevice(!NewDevice);
  };

  const toggleAddNewDevice = () => {
    setAddNewDevice(!AddNewDevice);
  };

  const addNewDevice = (deviceId: number, idHardcode: string) => {
    setAddNewDevice(true);
    console.log(AddNewDevice)
    if (deviceId){
      setSelectedId(deviceId)
      setSelectedIdHardcode(idHardcode)
      console.log(SelectedId)
    }    // assignDeviceUser(deviceId, usernameId)
  }

  const assignDevice = () => {
    if (SelectedId && DeviceName != ""){
      if (usernameId) {
        assignDeviceUser(SelectedId, usernameId, DeviceName)
        .then((response) => {
          if (response.success){
            setDeviceName("");
            setSelectedId(undefined)
            setSelectedIdHardcode("");
            toggleAddNewDevice();
            toggleNewDevice();
            setContentChanged(true)
          }
        })
        .catch((error) => {
          console.error('Error when obtaining branches (Username or password incorrect): ', error);
        });
      }
    }
  }

  const DeleteDevice = (dispositiuId: number) => {
    const confirm = window.confirm("Si elimines el dispositiu també s'eliminaran les seves dades. Vols continuar?")
    
    if (usernameId && confirm){
      deleteDeviceUser(dispositiuId, usernameId)
      .then((response) => {
        if (response.success){
          setContentChanged(true);
        }
      })
      .catch((error) => {
        console.error('Error when obtaining branches (Username or password incorrect): ', error);
      });
    }
  }

  useEffect(() => {
    if (usernameId != null){
      getUserDevices(usernameId)
        .then((response) => {
          setUserDevices(response)
          setContentChanged(false)
        })
        .catch((error) => {
          console.error('Error when obtaining branches (Username or password incorrect): ', error);
        });
    }
  }, [usernameId, ContentChanged])

  useEffect(() => {
    if (NewDevice) {
      getAvailableDevices()
      .then((response) => {
        setAvailableDevices(response)
      })
      .catch((error) => {
        console.error('Available devices error: ', error);
      });
    }
  }, [NewDevice])

  return(
    <div className="account-box device-box">
      <h2>Els meus dispositius</h2>
      <div className="device-list">
        {UserDevices?.dades.length == 0 && <p>No tens cap dispositiu assignat</p>}
        {UserDevices?.dades.map((dispositiu) => (
          <div key={`grup-${dispositiu.nomDispositiu}`} className="device-item">
            <div className="device-details">
              <strong className='dev-name'>{dispositiu.nomDispositiu}</strong> 
              <br />
              <strong>Identificador:</strong> {dispositiu.idHardcode}
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
        {AddNewDevice ?
        <div className="device-list">
            <div className="device-item">
              <div className="device-details">
                <strong className='dev-name'>Identificador: {SelectedIdHardcode}</strong>
                <br />
                <div className="device-name">
                  <label htmlFor="">Introdueix el nom del dispositiu:</label>
                  <br />
                <input type="text" placeholder='Nom del dispositiu' onChange={(e) => setDeviceName(e.target.value)}/> 
                </div>
              </div>
              <div className="device-actions">
                <Link className="add-device-link" to="#" onClick={assignDevice}>
                  Afegeix
                </Link>
                <Link className="logout-link" to="#" onClick={toggleAddNewDevice}>Cancel·la </Link>
              </div>
            </div>
        </div>
        
        :
        <div>
      <div className="device-list">
        {AvailableDevices?.dades.length == 0 && <p>No hi ha dispositius disponibles</p>}
        {AvailableDevices?.dades.map((dispositiu) => (
          <div key={`grup-${dispositiu.idDispositiu}`} className="device-item">
            <div className="device-details">
              <strong className='dev-name'>Identificador: {dispositiu.idHardcode}</strong> 
            </div>
            <div className="device-actions">
              <Link className="add-device-link" to="#" onClick={() => {{addNewDevice(dispositiu.idDispositiu, dispositiu.idHardcode)}}}>
                Afegeix
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Link className="logout-link" to="#" onClick={toggleNewDevice}>Cancel·la </Link>
      </div>
        } 
      </div>
      }
      
    </div>
  )
}
export default Devices;