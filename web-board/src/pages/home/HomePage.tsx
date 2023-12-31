import { useState, useEffect } from 'react';
import LastInfo from "../data/components/LastInfo"
import CurrentParameters from "../parameters/components/CurrentParameters"
import './HomePage.css'
import { getUserDevices, getLastWaterInfo } from "../../utils/api";
import { IUserDevices, ILastInfo } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';


export function HomePage() {
  const { usernameId } = useUser();
  const [UserDevices, setUserDevices] = useState<IUserDevices>();
  const [lastInfo, setLastInfo] = useState<ILastInfo>();


  useEffect(() => {
    if (usernameId != null){
      getUserDevices(usernameId)
      .then((response) => {
        setUserDevices(response)
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
    <div className="page-container">
      <div className="column">
        <CurrentParameters />
      </div>
      <div className="column">
      <h2>Informació dels últims regs</h2>
      {lastInfo?.dades.map((reg) => (
        <LastInfo key={reg.idDispositiu} deviceId={reg.idDispositiu} finalData={reg.dataHoraFi} startingData={reg.dataHoraInici}/>
          ))}

      </div>
    </div>
    </>

  )
}