import React from 'react';
import './CurrentParameters.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from "react-router-dom";


const CurrentParameters = () => {
  return (
    <div>
      <h2>Valors dels paràmetres actuals</h2>
      <p><FontAwesomeIcon icon="droplet" style={{ color: "#007ABF" }} /> Mínima humitat per regar: %</p>
      <p><FontAwesomeIcon icon="stop" style={{ color: "#007ABF" }} /> Humitat per aturar el reg: %</p>
      <Link className="edit-link-home" to="/parameters">Editar</Link>
      
    </div>
  );
};

export default CurrentParameters;
