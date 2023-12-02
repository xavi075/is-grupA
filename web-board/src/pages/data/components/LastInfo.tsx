import React from 'react';
import './LastInfo.css';

const LastInfo = () => {
  return (
    <div className="table-container">
      <table>
        <tbody>
          <tr>
            <td>Hora</td>
            <td>14:00</td>
          </tr>
          <tr>
            <td>Temperatura</td>
            <td>26ºC</td>
          </tr>
          <tr>
            <td>Humitat</td>
            <td>56%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LastInfo;
