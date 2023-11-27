import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
// import loginRequest from '../../../utils/api';
import { ILogged } from '../../../utils/interfaces';


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

  const [expanded, setExpanded] = useState(true);

    return (
      <>
      {expanded &&(
        <div>
          <h2>Inicia sessió</h2>
            <Form onSubmit={handleLogin}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Nom d'usuari </Form.Label>
              <Form.Control type="text" placeholder="Nom d'usuari" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Contrassenya </Form.Label>
              <Form.Control type="password" placeholder="Contrassenya" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button variant="primary" type="submit">
              Iniciar Sessió
            </Button>
          </Form>
          <div className={`${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(prevState => !prevState) }><p >Registra un nou compte</p></div>
        </div>
      )}
      {!expanded &&(
        <div>
          <h2>Registre d'un nou usuari</h2>
            <Form onSubmit={handleLogin}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Nom d'usuari </Form.Label>
              <Form.Control type="text" placeholder="Nom d'usuari" />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Nova Contrassenya </Form.Label>
              <Form.Control type="password" placeholder="Contrassenya" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Registra't
            </Button>
          </Form>
          <div className={`${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(prevState => !prevState) }><p >Inicia sessió d'un compte ja existent</p></div>
        </div>
      )}
      </>
    )
}

export default Login;