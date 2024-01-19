import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { loginRequest, registerRequest, validateRegisterRequest } from '../../../utils/api';
import { ILogged, IRegister } from '../../../utils/interfaces';
import './Login.css';

const Login =  () => {
  const { setUserNameId, setLoggedIn } = useUser();
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [loginInfo, setLoginInfo] = useState<ILogged>();
  const [registerInfo, setRegisterInfo] = useState<IRegister>();
  const [IncorrectLogin, setIncorrectLogin] = useState(false);

  const [RegisterEmail, setRegisterEmail] = useState('');
  const [RegisterName, setRegisterName] = useState('');
  const [RegisterPassword, setRegisterPassword] = useState('');
  const [IncorrectRegister, setIncorrectRegister] = useState(false);

  const [Validate, setValidate] = useState(false);
  const [validationCode, setValidationCode] = useState('');
  const [IncorrectCode, setIncorrectCode] = useState(false);


  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginRequest(mail, password)
        .then((response) => {
          setLoginInfo(response);
          if (response?.success){
            if (response.credencialsTrobades && response.idUsuari !== null){
              if (response.usuariVerificat){
                window.sessionStorage.setItem('usernameId', response.idUsuari.toString())
                setUserNameId(response.idUsuari.toString());
                setLoggedIn(!!response.idUsuari);
                setIncorrectLogin(false);
              } else {
                setValidate(true);
              }
            } else {
              setIncorrectLogin(true)
            }
          }
        })
        .catch((error) => {
          setIncorrectLogin(true)
        });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (RegisterEmail !== "" && RegisterName !== "" && RegisterPassword !== "") {
      registerRequest(RegisterEmail, RegisterName, RegisterPassword)
      .then((response) => {
        setRegisterInfo(response)
        if (response?.success){
          if (response.idUsuariInsertat !== null){
            setValidate(true);
            setIncorrectLogin(false);
            setIncorrectRegister(false);
          }
        } else {
          setValidate(false);
          setIncorrectRegister(true);
        }
      })
      .catch((error) => {
        setIncorrectRegister(true);
      }); 
    }
  }

  const handleSubmitCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationCode !== "") {
      if (expanded && loginInfo?.idUsuari){
        validateRegisterRequest(loginInfo.idUsuari.toString(), validationCode)
        .then((response) => {
          if (response?.success){
            if (response.usuariVerificat === true){
              if(loginInfo.idUsuari){
                window.sessionStorage.setItem('usernameId', loginInfo.idUsuari.toString())
                setUserNameId(loginInfo.idUsuari.toString());
                setLoggedIn(true);
              }
              setIncorrectCode(false);
              setIncorrectLogin(false);
              setIncorrectRegister(false);
            } else {
              setIncorrectCode(true);
            }
          } else {
            setValidate(false);
            setIncorrectRegister(true);
          }
        })
        .catch((error) => {
          setIncorrectRegister(true);
        }); 
      } else {
        if (registerInfo?.idUsuariInsertat)
        validateRegisterRequest(registerInfo?.idUsuariInsertat.toString(), validationCode)
        .then((response) => {
          if (response?.success){
            if (response.usuariVerificat === true){
                if (registerInfo?.idUsuariInsertat){
                  window.sessionStorage.setItem('usernameId', registerInfo.idUsuariInsertat.toString())
                  setUserNameId(registerInfo?.idUsuariInsertat?.toString())
                  setLoggedIn(!!registerInfo.idUsuariInsertat);
                }
              setIncorrectCode(false);
              setIncorrectLogin(false);
              setIncorrectRegister(false);
            }else {
              setIncorrectCode(true);
            }
          } else {
            setValidate(false);
            setIncorrectRegister(true);
          }
        })
        .catch((error) => {
          setIncorrectCode(true);
        }); 
      }
      
    }
  }

  const handleRestart = () => {
    setValidate(false)
    setUserNameId("")
    setLoggedIn(false)
    setIncorrectLogin(false)
    setIncorrectRegister(false)
    setMail("")
    setPassword("")
    setRegisterEmail("")
    setRegisterName("")
    setRegisterPassword("")
    setIncorrectCode(false);
    window.sessionStorage.removeItem('usernameId')

  }

  const [expanded, setExpanded] = useState(true);
    return (
      <>
      {Validate?
         <div className="form-container login-container">
          <Form className="custom-form" onSubmit={handleSubmitCode}>
            <h2>Confirmació de Registre</h2>
            {IncorrectCode && <p className='incorrect-message'>Codi incorrecte!</p>}
            <p>Hem enviat un codi de confirmació de registre al teu correu! Introdueix-lo a continuació:</p>
            {/* {IncorrectRegister && <span className='incorrect-message'>El correu electrònic ja es troba a la base de dades</span>} */}
            <Form.Group controlId="formBasicCode">
              <Form.Label className="custom-label"> <FontAwesomeIcon icon="user-check" style={{ color: "#007ABF" }} /> Introdueix el codi: </Form.Label>
              <Form.Control className="custom-input" type="text" placeholder="Codi de confirmació" onChange={(e) => setValidationCode(e.target.value)}/>
            </Form.Group>

            <Button className="form-button" variant="primary" type="submit">
              Confirma <FontAwesomeIcon size='sm' icon="check" style={{ color: "#FFFFFF" }} />
            </Button>
            <div className="login-register" ><span onClick={handleRestart}>Enrera</span></div>
          </Form>
         </div>
         :
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
        <>
        <div className="form-container login-container">
            <Form className="custom-form" onSubmit={handleRegister}>
            <h2>Registra un nou usuari</h2>
            {IncorrectRegister && <span className='incorrect-message'>El correu electrònic ja es troba a la base de dades</span>}
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
      </>
      )}
      </>
    }
    </>
  )
}

export default Login;