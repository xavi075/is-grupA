import { useState, useEffect } from 'react';
import { format, startOfDay, subMonths, subWeeks } from 'date-fns';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./dataTable.css";
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

  const convertDate = (date: string) => {
    const DateObject = new Date(date);
    const formattedDate = format(DateObject, 'dd-MM-yyyy HH:mm:ss')
    return formattedDate; 
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
    <Link className="date-change-link" to="#" onClick={handleAllData}>
      Totes les dades
    </Link>
    <Link className="date-change-link" to="#" onClick={handleLastMonth}>
      Últim mes
    </Link>
    <Link className="date-change-link" to="#" onClick={handleLastWeek}>
      Última setmana
    </Link>
    <Link className="date-change-link" to="#" onClick={handleToday}>
      Avui
    </Link>
    <table className='table-data'>
      <thead>
          <tr>
              <th>Data</th>
              <th>Humitat (%)</th>
              <th>Temperatura (ºC)</th>
          </tr>
      </thead>
      <tbody>
        {Data?.dades.reverse().map((mostra) => (
          <tr>
            <td>{convertDate(mostra.dataHora)}</td>
            <td>{mostra.dadaHum}</td>
            <td>{mostra.dadaTemp}</td>
          </tr>
        ))}
      </tbody>
    </table> 
    </div>
    </>
  )
}

export default DataTable;