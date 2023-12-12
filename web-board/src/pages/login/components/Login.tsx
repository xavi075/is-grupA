import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { loginRequest, registerRequest } from '../../../utils/api';
import { ILogged } from '../../../utils/interfaces';
import './Login.css';


const Login =  () => {
  const { setUserNameId, setLoggedIn } = useUser();
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [loginInfo, setLoginInfo] = useState<ILogged>();
  const [IncorrectLogin, setIncorrectLogin] = useState(false);

  const [RegisterEmail, setRegisterEmail] = useState('');
  const [RegisterName, setRegisterName] = useState('');
  const [RegisterPassword, setRegisterPassword] = useState('');


  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    loginRequest(mail, password)
        .then((response) => {
          setLoginInfo(response);
          if (response?.success){
            if (response.credencialsTrobades && response.idUsuari != null){
              window.sessionStorage.setItem('usernameId', response.idUsuari.toString())
              setUserNameId(response.idUsuari.toString());
              setLoggedIn(!!response.idUsuari);
              setIncorrectLogin(false);
            } else {
              setIncorrectLogin(true)
            }
          }
        })
        .catch((error) => {
          console.error('Error login: ', error);
        });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Previ a registre: ', RegisterEmail, RegisterName, RegisterPassword)
    registerRequest(RegisterEmail, RegisterName, RegisterPassword)
        .then((response) => {
          console.log(response)
          if (response?.success){
            // if (response.credencialsTrobades && response.idUsuari != null){
            //   window.sessionStorage.setItem('username', response.idUsuari.toString())
            //   setUserNameId(response.idUsuari.toString());
            //   setLoggedIn(!!response.idUsuari);
            //   setIncorrectLogin(false);
            // } else {
            //   setIncorrectLogin(true)
            // }
            if (response.idUsuariInsertat != null){
              console.log(response.idUsuariInsertat)
              window.sessionStorage.setItem('usernameId', response.idUsuariInsertat.toString())
              setUserNameId(response.idUsuariInsertat.toString());
              setLoggedIn(!!response.idUsuariInsertat);
              setIncorrectLogin(false);
            }

          }
        })
        .catch((error) => {
          console.error('Error Register: ', error);
        });
    
    // TO-DO: agafar usuari i password i enviar peticio POST register
    // TO-DO: rebre resposta peticio
    // TO-DO: login?
  }

  const [expanded, setExpanded] = useState(true);

    return (
      <>
      {expanded &&(
        <div className="form-container login-container">
            <Form className="custom-form" onSubmit={handleLogin}>
            <h2>Inicia sessió</h2>
            {IncorrectLogin && <span className='incorrect-message'>Correu electrònic o contrasenya incorrectes. Torna a provar</span>}
            <Form.Group controlId="formBasicUsername">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="envelope" style={{ color: "#007ABF" }} /> Correu electrònic </Form.Label>
              <Form.Control className="custom-input" type="email" placeholder="exemple@exemple.com" value={mail} onChange={(e) => setMail(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Contrasenya </Form.Label>
              <Form.Control className="custom-input" type="password" placeholder="Contrasenya" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button className="form-button" variant="primary" type="submit">
              Iniciar Sessió <FontAwesomeIcon icon="right-to-bracket" style={{ color: "#FFFFFF" }} />
            </Button>
            <div className="login-register" onClick={() => setExpanded(prevState => !prevState) }><span>Registra un nou compte</span></div>
          </Form>
        </div>
      )}
      {!expanded &&(
        <div className="form-container login-container">
            <Form className="custom-form" onSubmit={handleRegister}>
            <h2>Registra un nou usuari</h2>
            <Form.Group controlId="formBasicEmail">
              <Form.Label className="custom-label"> <FontAwesomeIcon icon="envelope" style={{ color: "#007ABF" }} /> Correu electrònic </Form.Label>
              <Form.Control className="custom-input" type="email" placeholder="exemple@exemple.com" value={RegisterEmail} onChange={(e) => setRegisterEmail(e.target.value)}/>
            </Form.Group>

            <Form.Group controlId="formBasicUsername">
              <Form.Label className="custom-label"> <FontAwesomeIcon icon="user-large" style={{ color: "#007ABF" }} /> Nom d'usuari </Form.Label>
              <Form.Control className="custom-input" type="text" placeholder="Nom d'usuari" value={RegisterName} onChange={(e) => setRegisterName(e.target.value)}/>
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Nova Contrasenya </Form.Label>
              <Form.Control className="custom-input" type="password" placeholder="Contrasenya" value={RegisterPassword} onChange={(e) => setRegisterPassword(e.target.value)}/>
            </Form.Group>

            <Button className="form-button" variant="primary" type="submit">
              Registra't <FontAwesomeIcon size='sm' icon="user-plus" style={{ color: "#FFFFFF" }} />
            </Button>
            <div className="login-register" onClick={() => setExpanded(prevState => !prevState) }><span>Inicia sessió d'un compte ja existent</span></div>
          </Form>
        </div>
      )}
      </>
    )
}

export default Login;