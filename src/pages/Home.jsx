import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/shared/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <HeroSection/>
      <Footer/>
    </div>
  )
}