import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import loginRequest from '../../../utils/api';
import { ILogged } from '../../../utils/interfaces';
import './Login.css';


const Login =  () => {
  const { setUserName, setLoggedIn } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [loginInfo, setLoginInfo] = useState<ILogged>()

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // loginRequest(username, password)
    //     .then((response) => {
    //       setLoginInfo(response)
    //       window.sessionStorage.setItem('username', loginInfo.username)
    //       setUserName(userName);
    //       setLoggedIn(!!userName);
    //     })
    //     .catch((error) => {
    //       console.error('Error when obtaining branches (Username or password incorrect): ', error);
    //     });

    // DEBUG mode
    window.sessionStorage.setItem('username', username)
    setUserName(username);
    setLoggedIn(!!username);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //Nomes si no cal tornar a pagina login
    // TO-DO: agafar usuari i password i enviar peticio POST register
    // TO-DO: rebre resposta peticio
    // TO-DO: login?
  }

  const [expanded, setExpanded] = useState(true);

    return (
      <>
      {expanded &&(
        <div className="form-container">
            <Form className="custom-form" onSubmit={handleLogin}>
            <h1>Inicia sessió</h1>
            <Form.Group controlId="formBasicUsername">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="user-large" style={{ color: "#007ABF" }} /> Nom d'usuari </Form.Label>
              <Form.Control className="custom-input" type="text" placeholder="Nom d'usuari" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Contrassenya </Form.Label>
              <Form.Control className="custom-input" type="password" placeholder="Contrassenya" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button className="form-button" variant="primary" type="submit">
              Iniciar Sessió <FontAwesomeIcon icon="right-to-bracket" style={{ color: "#FFFFFF" }} />
            </Button>
            <div className="login-register" onClick={() => setExpanded(prevState => !prevState) }><span>Registra un nou compte</span></div>
          </Form>
        </div>
      )}
      {!expanded &&(
        <div className="form-container">
            <Form className="custom-form" onSubmit={handleRegister}>
            <h1>Registra un nou usuari</h1>
            <Form.Group controlId="formBasicUsername">
              <Form.Label className="custom-label"> <FontAwesomeIcon icon="user-large" style={{ color: "#007ABF" }} /> Nom d'usuari </Form.Label>
              <Form.Control className="custom-input" type="text" placeholder="Nom d'usuari" />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className="custom-label"><FontAwesomeIcon icon="key" style={{ color: "#007ABF" }} /> Nova Contrassenya </Form.Label>
              <Form.Control className="custom-input" type="password" placeholder="Contrassenya" />
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