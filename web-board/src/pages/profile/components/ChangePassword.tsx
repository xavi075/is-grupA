import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './../../login/components/Login.css';
import { changePwdRequest } from '../../../utils/api';
import { IChangedPwd } from '../../../utils/interfaces';
import { Link } from "react-router-dom";


const ChangePassword =  () => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const { usernameId } = useUser();
  const [ChangedPwd, setChangedPwd] = useState<IChangedPwd>()
  const [ChangePwd, setChangePwd] = useState(false);
  const [IncorrectPwd, setIncorrectPwd] = useState(false);

  const toggleChangePwd = () => {
    setChangePwd(!ChangePwd);
  };


  const handleChangePwd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (usernameId != null){
      if (currentPwd !== "" && newPwd !== ""){
        changePwdRequest(usernameId, currentPwd, newPwd)
        .then((response) => {
          if (response.success){
            setChangedPwd(response) //PRESCINDIBLE
            setChangePwd(false)
          }
        })
        .catch((error) => {
          setIncorrectPwd(true)
          console.error('Incorrect password: ', error); //DEMANAR FERRAN GESTIÓ D'ERRORS
        });

        setIncorrectPwd(false);

        
      } else {
        setIncorrectPwd(true);
      }
      
    }

  };

  return (
    <div className='change-password-container'>
      <Link className="change-password-link" to="#" onClick={toggleChangePwd}>{!ChangePwd? "Canviar contrasenya" : "Enrera"} {!ChangePwd? <FontAwesomeIcon icon="caret-right" style={{ color: "#007ABF" }} /> : <FontAwesomeIcon icon="caret-down" style={{ color: "#007ABF" }} />}</Link>
      {ChangePwd &&
        <div className="form-container password-container">
          <Form className="custom-form" onSubmit={handleChangePwd}>
          <h3>Canvia la contrasenya</h3>
          {IncorrectPwd && <span className='incorrect-message'>Contrasenyes buides o incorrectes</span>}
          <Form.Group controlId="formBasicUsername">
            <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Contrasenya actual </Form.Label>
            <Form.Control className="custom-input" type="password" placeholder="Contrassenya actual" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label className="custom-label"><FontAwesomeIcon icon="pen" style={{ color: "#007ABF" }} /> Nova contrasenya </Form.Label>
            <Form.Control className="custom-input" type="password" placeholder="Nova contrassenya" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </Form.Group>

          <Button className="form-button" variant="primary" type="submit">
          Canvia la contrasenya <FontAwesomeIcon icon="pen-to-square" style={{ color: "#FFFFFF" }} />
          </Button>
        </Form>
        </div>
      }
    </div>
  )
}

export default ChangePassword;