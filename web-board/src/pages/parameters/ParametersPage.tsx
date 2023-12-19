import { useState, useEffect } from 'react';
import { IUserDevices } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';
import { getUserDevices } from "../../utils/api";
import ChangeParameters from "./components/ChangeParameters"

export function ParametersPage() {
    const { usernameId } = useUser();
    const [UserDevices, setUserDevices] = useState<IUserDevices>();
    const [selectedDevice, setSelectedDevice] = useState('');

    const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value;
      setSelectedDevice(selectedValue);
    };



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
            <h2>Paràmetres dels dispositius</h2>
            {/* {UserDevices?.dades.map((dispositiu) => (
            <div key={`${dispositiu.nomDispositiu}`}>
              <ChangeParameters key={dispositiu.id} deviceId={dispositiu.id}/>
            </div>
        ))} */}
      <div>
        <label htmlFor="dispositivo">Selecciona un dispositiu: </label>
        <select id="dispositivo" value={selectedDevice} onChange={handleDeviceChange}>
          <option value="">-- Selecciona un dispositiu --</option>
          {UserDevices?.dades.map((dispositiu) => (
            <option key={dispositiu.id} value={dispositiu.id}>
              {dispositiu.nomDispositiu}
            </option>
          ))}
        </select>

        {/* <p>Dispositiu seleccionat: {selectedDevice}</p> */}
        {selectedDevice &&<ChangeParameters key={selectedDevice} deviceId={parseInt(selectedDevice)}/>}


    </div>

        <div key={`${UserDevices?.dades[0].nomDispositiu}`}>
        </div>

            
        </div>
    )
}