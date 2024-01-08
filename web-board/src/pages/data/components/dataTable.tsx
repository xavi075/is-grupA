import { useState, useEffect } from 'react';
import { format, startOfDay, subMonths, subWeeks } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./dataTable.css";
import { IData, IWaterChanges } from '../../../utils/interfaces';
import { getDeviceData, getWaterChanges } from '../../../utils/api';
import { Link } from "react-router-dom";
import { convertDate } from '../../../utils/functions';

import { HumidityChart } from './MoistureGraph';
import moment from 'moment';


const DataTable =  (props: {deviceId: number | undefined}) => {

  const [StartDate, setStartDate] = useState("");
  const [FinalDate, setFinalDate] = useState("");
  const [Data, setData] = useState<IData>();
  const [WaterChanges, setWaterChanges] = useState<IWaterChanges>();
  
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
    const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
    const formattedFinalDate = format(finalDate, 'yyyy-MM-dd HH:mm:ss');


    setStartDate(formattedFinalDate);
    setFinalDate(formattedStartDate);
  }

  const extractHumidityData = (): Array<{ date: string; humidity: number, temperature: number }> => {
    if (!Data || !Data.dades) {
      return [];
    }

    return Data.dades.map((element) => ({
      date: moment(element.dataHora, 'ddd, DD MMM YYYY HH:mm:ss [GMT]').format('MMM D, HH:mm:ss'),
      humidity: element.dadaHum,
      temperature: element.dadaTemp
    }));
  };
  
useEffect(() => {
  if (props.deviceId != undefined){
    getDeviceData(props.deviceId, StartDate, FinalDate)
    .then((response) => {
        setData(response)
        if (props.deviceId){
          getWaterChanges(props.deviceId, StartDate, FinalDate)
          .then((response) => {
            setWaterChanges(response)
        })
        .catch((error) => {
            console.error('Error when Water changes: ', error);
        });
        }
    })
    .catch((error) => {
        console.error('Error when device data: ', error);
    });
  }
  }, [props.deviceId, StartDate])

  return (
    <>
    
    <div className='data-table-container'>
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
    <h3><FontAwesomeIcon icon="table-list" style={{ color: "#007ABF" }} size='lg' /> Registre de dades</h3>
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
        {Data?.dades.reverse().map((mostra, index) => (
          <tr key={`Taula1${index}`}>
            <td>{convertDate(mostra.dataHora)}</td>
            <td>{mostra.dadaHum}</td>
            <td>{mostra.dadaTemp}</td>
          </tr>
        ))}
      </tbody>
    </table> 
    </div>
    {Data?.dades.length === 0 && <p>Encara no hi ha dades per aquest dispositiu</p>}
    </div>
      <h3><FontAwesomeIcon icon="chart-line" style={{ color: "#007ABF" }} size='lg'/> Gràfica d'humitat i temperatura</h3>
      {Data?.dades.length === 0 ? <p>No hi ha dades per mostrar a la gràfica</p>:
        <HumidityChart dataInfo={extractHumidityData()} />
      }

      <h3><FontAwesomeIcon icon="repeat" style={{ color: "#007ABF" }} size='lg' /> Canvis en el reg</h3>
    <div className='table-scroll-container'>
    <table className='table-data'>
      <thead>
          <tr>
              <th>Data</th>
              <th>Estat</th>
          </tr>
      </thead>
      <tbody>
        {WaterChanges?.dades.reverse().map((mostra, index) => (
          <tr key={`Taula2-${index}`}>
            <td>{convertDate(mostra.dataHora)}</td>
            <td>{mostra.estatReg ? "Inici de reg": "Final de reg"}</td>
          </tr>
        ))}
      </tbody>
    </table> 
    </div>
    {WaterChanges?.dades.length === 0 && <p>Encara no hi ha dades del reg per aquest dispositiu</p>}
    </>
  )
}

export default DataTable;