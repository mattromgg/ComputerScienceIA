import {useState, useEffect} from 'react'
import './styles/App.css'
import Navbar from './Navbar'
import Schedule from './Schedule'
import AddStudentModal from './AddStudentModal'
import AddTeacherModal from './AddTeacherModal'
import AddClassModal from './AddClassModal'

function App() {

  return (
    <div className='app'>
      <nav>
        <Navbar />
        <AddStudentModal />
        <AddTeacherModal />
        <AddClassModal />
      </nav>
      <Schedule /> 
    </div>
  )
}

export default App
