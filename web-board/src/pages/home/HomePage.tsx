import { useState, useEffect } from 'react';
import LastInfo from "../data/components/LastInfo"
import CurrentParameters from "../parameters/components/CurrentParameters"
import './HomePage.css'
import { getUserDevices } from "../../utils/api";
import { IUserDevices } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';


export function HomePage() {
  const { usernameId } = useUser();
  const [UserDevices, setUserDevices] = useState<IUserDevices>();

  useEffect(() => {
    if (usernameId != null){
      getUserDevices(usernameId)
      .then((response) => {
        setUserDevices(response)
      })
      .catch((error) => {
        console.error('Error when user devices: ', error);
      });
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
      {UserDevices?.dades.map((dispositiu) => (
        <LastInfo deviceId={dispositiu.id}/>
          ))}

      </div>
    </div>
    </>

  )
}