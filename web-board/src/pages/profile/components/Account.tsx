import { useState } from 'react';
import ChangePassword from './ChangePassword';
import { useUser } from '../../../context/UserContext';
import { Link } from "react-router-dom";


const Account =  () => {
  const { setUserNameId, setLoggedIn } = useUser();
  // const [ChangePwd, setChangePwd] = useState(false);

  const logout = () => {
    window.sessionStorage.removeItem('username')
    setUserNameId(null)
    setLoggedIn(false)
  }

  return(
    <div className="account-box">
      <p>Account page</p>
      {/* TO-DO: Change pwd*/}
      <Link className="logout-link" to="/" onClick={logout}>Tanca la sessió</Link>
      {/* <Link className="change-password-link" to="#" onClick={toggleChangePwd}>{!ChangePwd? "Canviar contrassenya": "Enrera"}</Link> */}
      {/* {ChangePwd && <ChangePassword />} */}
      <ChangePassword />
    </div>
  )
}
export default Account;