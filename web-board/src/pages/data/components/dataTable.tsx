import { useState, useEffect } from 'react';
import { format, startOfDay, subMonths, subWeeks } from 'date-fns';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./dataTable.css";
import { IData } from '../../../utils/interfaces';
import { getDeviceData, insertThreshold } from '../../../utils/api';
import { Link } from "react-router-dom";
import { convertDate } from '../../../utils/functions';

import HumidityChart from './MoistureGraph';
import moment from 'moment';





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

    console.log(TodayDate)

    setDates(CurrentDate, TodayDate);
  };

  const setDates = (startDate: Date, finalDate: Date) => {
    const formattedStartDate = format(startDate, 'dd-MM-yyyy HH:mm:ss');
    const formattedFinalDate = format(finalDate, 'dd-MM-yyyy HH:mm:ss');

    console.log(formattedStartDate);
    console.log(formattedFinalDate);

    setStartDate(formattedStartDate);
    setFinalDate(formattedFinalDate);
  }

  const extractHumidityData = (): Array<{ date: string; humidity: number }> => {
    if (!Data || !Data.dades) {
      return [];
    }

    return Data.dades.map((element) => ({
      date: moment(element.dataHora, 'DD-MM-YYYY HH:mm:ss').format('MMM D, HH:mm:ss'),
      humidity: element.dadaHum,
    }));
  };


  const data = [
    // { date: new Date("2023-07-21"), humidity: 50 },
    // { date: new Date("2023-07-22"), humidity: 60 }
    { date: '0', humidity: 50 },
    { date: '1', humidity: 60 }
  ];

  


useEffect(() => {
  if (props.deviceId != undefined){
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
    <div className='table-scroll-container'>
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
    </div>
    <h3>Gràfica d'humitat</h3>
      <HumidityChart dataInfo={extractHumidityData()} />
    </>
  )
}

export default DataTable;