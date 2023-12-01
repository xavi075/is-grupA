import { useState } from 'react';
import ChangePassword from './ChangePassword';
import { useUser } from '../../../context/UserContext';
import { Link } from "react-router-dom";
import './Account.css'


const Account =  () => {
  const { setUserNameId, setLoggedIn } = useUser();

  const logout = () => {
    window.sessionStorage.removeItem('username')
    setUserNameId(null)
    setLoggedIn(false)
  }

  return(
    <div className="account-box">
      <h2>Account page</h2>
      <Link className="logout-link" to="/" onClick={logout}>Tanca la sessió</Link>
      <ChangePassword />
    </div>
  )
}
export default Account;