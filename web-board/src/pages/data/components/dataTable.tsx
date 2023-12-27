import { useState, useEffect } from 'react';
import { format, set, setDate, startOfDay, subMonths, subWeeks } from 'date-fns';

import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import "./ChangeParameters.css";
import { IData } from '../../../utils/interfaces';
import { getDeviceData, insertThreshold } from '../../../utils/api';
import { Link } from "react-router-dom";




const DataTable =  (props: {deviceId: number | undefined}) => {
//   const { usernameId } = useUser();
  const [ContentChanged, setContentChanged] = useState(false);

  const [StartDate, setStartDate] = useState("");
  const [FinalDate, setFinalDate] = useState("");
  const [Data, setData] = useState<IData>();

  
  const handleAllData = () => {
    setStartDate("");
    setFinalDate("");
  };

  const handleLastMonth = () => {
    const CurrentDate = new Date();
    const OneMonthDate = subMonths(CurrentDate, 1);

    setDates(CurrentDate, OneMonthDate);
  };

  const handleLastWeek = () => {
    const CurrentDate = new Date();
    const OneWeekDate = subWeeks(CurrentDate, 1);

    setDates(CurrentDate, OneWeekDate);
  };

  const handleToday = () => {
    const CurrentDate = new Date();
    const TodayDate = startOfDay(CurrentDate);

    setDates(CurrentDate, TodayDate);
  };

  const setDates = (startDate: Date, finalDate: Date) => {
    const formattedStartDate = format(startDate, 'dd-MM-yyyy HH:mm:ss');
    const formattedFinalDate = format(finalDate, 'dd-MM-yyyy HH:mm:ss');

    setStartDate(formattedStartDate);
    setFinalDate(formattedFinalDate);
  }


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
  }, [props.deviceId, ContentChanged, StartDate])
  // TO-DO: Canviar startdate per un estat de dates canviades?

  return (
    <>
    <div className='data-table-container'>
    <h3>Registre de dades</h3>
    {/* TO-DO: Botons amb handle que modifiquen states */}
    <Link className="add-device-link" to="#" onClick={handleAllData}>
      Totes les dades
    </Link>
    <Link className="add-device-link" to="#" onClick={handleLastMonth}>
      Últim mes
    </Link>
    <Link className="add-device-link" to="#" onClick={handleLastWeek}>
      Última setmana
    </Link>
    <Link className="add-device-link" to="#" onClick={handleToday}>
      Avui
    </Link>
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