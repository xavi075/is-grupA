import ChangePassword from './ChangePassword';
import { useUser } from '../../../context/UserContext';
import { Link } from "react-router-dom";
import './Account.css'


const Account =  () => {
  const { setUserNameId, setLoggedIn } = useUser();

  const logout = () => {
    window.sessionStorage.removeItem('usernameId')
    setUserNameId(null)
    setLoggedIn(false)
  }

  return(
    <div className="account-box">
      <h2>El meu compte</h2>
      <ChangePassword />
      <Link className="logout-link" to="/" onClick={logout}>Tanca la sessió</Link>
    </div>
  )
}
export default Account;