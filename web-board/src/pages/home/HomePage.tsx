import { useState, useEffect } from 'react';
import LastInfo from "../data/components/LastInfo"
import CurrentParameters from "../parameters/components/CurrentParameters"
import './HomePage.css'
import { getLastMeasure, getLastWaterInfo } from "../../utils/api";
import { ILastInfo, IData } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';
import LastMeasure from './components/LastMeasure';


export function HomePage() {
  const { usernameId } = useUser();
  const [UserMeasures, setUserMeasures] = useState<IData>();
  const [lastInfo, setLastInfo] = useState<ILastInfo>();


  useEffect(() => {
    if (usernameId != null){
      getLastMeasure(usernameId)
      .then((response) => {
        setUserMeasures(response)
        getLastWaterInfo(usernameId)
        .then((response) => {
            setLastInfo(response)
        })
        .catch((error) => {
            console.error('Error when Lat Water info: ', error);
        });
      })
      .catch((error) => {
        console.error('Error when user devices: ', error);
      });


      // TO-DO: Fer-la a l'acabar la primera amb boolean state
    }
    }, [usernameId])

  return (
    <>           
    <div className="page-box home">
      <div className="column">
        {/* <CurrentParameters /> */}
        <h2>Últimes mesures</h2>
        {UserMeasures?.dades.map((mesura) => (
          <LastMeasure key={mesura.idDispositiu} nomDispositiu={mesura.nomDispositiu} dadaHum={mesura.dadaHum} dadaTemp={mesura.dadaTemp} dataHora={mesura.dataHora}/>
        ))}
      </div>
      <div className="column">
      <h2>Últims regs</h2>
      {lastInfo?.dades.map((reg) => (
        <LastInfo key={reg.idDispositiu} deviceId={reg.idDispositiu} finalData={reg.dataHoraFi} startingData={reg.dataHoraInici}/>
          ))}
      </div>
    </div>
    </>

  )
}