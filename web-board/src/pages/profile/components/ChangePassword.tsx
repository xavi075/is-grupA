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

  const toggleChangePwd = () => {
    setChangePwd(!ChangePwd);
  };


  const handleChangePwd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TO-DO: Comprovar contrassenya actual
    if (usernameId != null){
      changePwdRequest(usernameId, newPwd)
        .then((response) => {
          setChangedPwd(response)
        })
        .catch((error) => {
          console.error('Error when obtaining branches (Username or password incorrect): ', error);
        });
      if (ChangedPwd){
        toggleChangePwd()
      }
    }

  };

  return (
    <>
      <Link className="change-password-link" to="#" onClick={toggleChangePwd}>{!ChangePwd? "Canviar contrassenya": "Enrera"}</Link>
      {ChangePwd &&
        <div className="form-container password-container">
          <Form className="custom-form" onSubmit={handleChangePwd}>
          <h3>Canvia la contrassenya</h3>
          <Form.Group controlId="formBasicUsername">
            <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Contrassenya actual </Form.Label>
            <Form.Control className="custom-input" type="password" placeholder="Contrassenya actual" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label className="custom-label"><FontAwesomeIcon icon="pen" style={{ color: "#007ABF" }} /> Nova contrassenya </Form.Label>
            <Form.Control className="custom-input" type="password" placeholder="Nova contrassenya" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </Form.Group>

          <Button className="form-button" variant="primary" type="submit">
          Canvia la contrassenya <FontAwesomeIcon icon="pen-to-square" style={{ color: "#FFFFFF" }} />
          </Button>
        </Form>
        </div>
      }
    </>
  )
}

export default ChangePassword;