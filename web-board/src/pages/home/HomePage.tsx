import LastInfo from "../data/components/LastInfo"
import './HomePage.css'
export function HomePage() {
  return (
    <>           
    <div className="page-container">
      <div className="column">
        <h2>Home Page</h2>
      </div>
      <div className="column">
        <LastInfo />
      </div>
    </div>
    </>

  )
}