import MovieList from '../components/MovieComponents/MovieList'
import Header from '../components/common/Header'
import SubHead from '../components/HomepageComponents/Subhead'
import Footer from '../components/common/Footer'
import Spot from '../components/HomepageComponents/Spot'

function Homepage() {
  return (
    <div className= 'min-h-screen w-full flex flex-col'>
      <Header/>
      <div className='flex justify-center'>
        <Spot/>
      </div>
      <div className='-mt-24'>
        <SubHead/>
      </div>
      <MovieList/>
      <Footer/>
    </div>
    
  )
}

export default Homepage