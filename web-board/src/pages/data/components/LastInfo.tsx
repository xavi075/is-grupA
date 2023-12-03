import React from 'react';
import './LastInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const LastInfo = () => {

  // TO-DO: mostrar dades de l'API
  return (
    <div className="table-container">
      <h2>Informació de l'últim reg</h2>
      <table className='table-info'>
        <tbody>
          <tr>
            <td><FontAwesomeIcon icon="clock" style={{ color: "#007ABF" }} /> Hora</td>
            <td>14:00h</td>
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="temperature-low" style={{ color: "#007ABF" }} /> Temperatura</td>
            <td>26ºC</td>
          </tr>
          <tr>
            <td><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Humitat</td>
            <td>56%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LastInfo;
