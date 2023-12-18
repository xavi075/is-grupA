import { useState, useEffect } from 'react';
import { IUserDevices } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';
import { getUserDevices } from "../../utils/api";
import ChangeParameters from "./components/ChangeParameters"

export function ParametersPage() {
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
        <div>
            <h2>Parameters page</h2>
            {/* {UserDevices?.dades.map((dispositiu) => (
            <div key={`${dispositiu.nomDispositiu}`}>
              <ChangeParameters key={dispositiu.id} deviceId={dispositiu.id}/>
            </div>
        ))} */}

        <div key={`${UserDevices?.dades[0].nomDispositiu}`}>
        <ChangeParameters key={UserDevices?.dades[0].id} deviceId={UserDevices?.dades[0].id}/>
        </div>

            
        </div>
    )
}