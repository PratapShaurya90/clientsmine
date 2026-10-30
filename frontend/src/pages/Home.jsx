import Navbar from "../components/Navbar"
import LandingPage from "../sections/LandingPage"
import Grids from "./Grids"

const Home = () => {
    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar />
            <LandingPage />
            <Grids />
            
            
        </div>
    )
}

export default Home