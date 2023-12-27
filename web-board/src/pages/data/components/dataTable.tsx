import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import "./ChangeParameters.css";
import { IData } from '../../../utils/interfaces';
import { getDeviceData, insertThreshold } from '../../../utils/api';
import { Link } from "react-router-dom";




const DataTable =  (props: {deviceId: number | undefined}) => {
//   const { usernameId } = useUser();
  const [ContentChanged, setContentChanged] = useState(false);
  const [LlindarInferior, setLlindarInferior] = useState(30);
  const [LlindarSuperior, setLlindarSuperior] = useState(50);
  const [StartDate, setStartDate] = useState("");
  const [FinalDate, setFinalDate] = useState("");
  const [Data, setData] = useState<IData>();

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
    // TO-DO: COnfirmar que no cal userId
    getDeviceData(props.deviceId, StartDate, FinalDate)
    .then((response) => {
        setData(response)
    })
    .catch((error) => {
        console.error('Error when user devices: ', error);
    });
  }
  }, [props.deviceId, ContentChanged])

  return (
    <>
    <div className='data-table-container'>
    <h3>Registre de dades</h3>
    <table className='table-info'>
      <thead>
          <tr>
              <th>Data</th>
              <th>Humitat (%)</th>
              <th>Temperatura (ºC)</th>
          </tr>
      </thead>
      <tbody>
        {Data?.dades.map((mostra) => (
          <tr>
            <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora d'inici</td>
            <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Hora de final</td>
            <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Temps total regant</td>
          </tr>
        ))}
      </tbody>
    </table> 
    </div>
    </>
  )
}

export default DataTable;