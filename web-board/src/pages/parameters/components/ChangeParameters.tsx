import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./ChangeParameters.css";
import { IUserDevices } from '../../../utils/interfaces';
import { getUserDevices, getDeviceInfo, insertThreshold } from '../../../utils/api';
import { Link } from "react-router-dom";




const ChangeParameters =  (props: {deviceId: number | undefined}) => {
  const { usernameId } = useUser();
  const [Device, setDevice] = useState<IUserDevices>();
  const [ContentChanged, setContentChanged] = useState(false);
  const [LlindarInferior, setLlindarInferior] = useState(30);
  const [LlindarSuperior, setLlindarSuperior] = useState(50);

  const handleLlindarInferiorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < LlindarSuperior && value !== LlindarInferior) {
      setLlindarInferior(value);
    }
  };
  
  const handleLlindarSuperiorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value > LlindarInferior && value !== LlindarSuperior) {
      setLlindarSuperior(value);
    }
  };

  const handleGuardar = () => {
    console.log('Llindar Inferior:', LlindarInferior);
    console.log('Llindar Superior:', LlindarSuperior);
    if (LlindarInferior && LlindarSuperior && props.deviceId != null){
      insertThreshold(props.deviceId, LlindarInferior, LlindarSuperior)
      //TO-DO: Manejar resposta
      setContentChanged(true)
    }
  };

useEffect(() => {
  if (props.deviceId != undefined){
    getDeviceInfo(props.deviceId)
    .then((response) => {
        setDevice(response)
        setLlindarInferior(response.dades[0].llindarMinimReg)
        setLlindarSuperior(response.dades[0].llindarMaximReg)
        setContentChanged(false)
    })
    .catch((error) => {
        console.error('Error when user devices: ', error);
    });
  }
  }, [props.deviceId, ContentChanged])

  return (
    <>
    <div className='current-parameters'>
      <h3>Valors dels paràmetres actuals</h3>
      <p><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Mínima humitat per regar: {Device?.dades[0].llindarMinimReg}%</p>
      <p><FontAwesomeIcon icon="stop" style={{ color: "#007ABF" }} /> Humitat per aturar el reg: {Device?.dades[0].llindarMaximReg}%</p>      
    </div>
    <div className='change-parameters-container'>
      {Device?.dades.map((dispositiu) => (
        <div key={`${dispositiu.nomDispositiu}`}>
          <p key={`${dispositiu.id}`}>Dispositiu {dispositiu.nomDispositiu}</p>
            <div className="rang-input">
              <label htmlFor="LlindarInferior">Llindar Inferior: {LlindarInferior}%</label>
              <br />
              <input type="range" id="LlindarInferior" min={0} max={100} value={LlindarInferior} onChange={handleLlindarInferiorChange}/>
            </div>

            <div className="rang-input">
              <label htmlFor="LlindarSuperior">Llindar Superior: {LlindarSuperior}%</label>
              <br />
              <input type="range" id="LlindarSuperior" min={0} max={100} value={LlindarSuperior} onChange={handleLlindarSuperiorChange}/>
            </div>
            <Link className="edit-link" to="#" onClick={handleGuardar}>Guardar</Link>
        </div>
      ))}
    </div>
    </>
  )
}

export default ChangeParameters;