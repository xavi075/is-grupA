import { useEffect, useState } from 'react';
import { IUserDevices } from '../../utils/interfaces';
import { useUser } from '../../context/UserContext';
import { getUserDevices } from "../../utils/api";
import LastInfo from './components/LastInfo';
import DataTable from './components/dataTable';

export function DataPage() {
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
    <div className='page-box'>
      <h2>Dades dels dispositius</h2>
      <div className='select-device-box'>
        <label htmlFor="dispositiu">Selecciona un dispositiu: </label>
        <select id="dispositiu" value={selectedDevice} onChange={handleDeviceChange}>
          <option value="">-- Selecciona un dispositiu --</option>
          {UserDevices?.dades.map((dispositiu) => (
            <option key={dispositiu.id} value={dispositiu.id}>
              {dispositiu.nomDispositiu}
            </option>
          ))}
        </select>

        {selectedDevice &&<DataTable key={selectedDevice} deviceId={parseInt(selectedDevice)}/>}


      </div>
          
    </div>
  )
}