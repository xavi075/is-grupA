import LastInfo from "../data/components/LastInfo"
import CurrentParameters from "../parameters/components/CurrentParameters"
import './HomePage.css'
export function HomePage() {
  return (
    <>           
    <div className="page-container">
      <div className="column">
        <h2>Home Page</h2>
        <CurrentParameters />
      </div>
      <div className="column">
        <LastInfo />
      </div>
    </div>
    </>

  )
}