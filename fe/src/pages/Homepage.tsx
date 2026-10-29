import MovieList from '../components/MovieComponents/MovieList'
import Header from '../components/Header'
import SubHead from '../Subhead'
import Footer from '../components/Footer'
import Spot from '../Spot'

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