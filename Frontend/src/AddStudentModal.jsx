import "./styles/Modal.css"
import {useState} from 'react'
import {createPortal} from 'react-dom'
import AddStudentModalContent from './AddStudentModalContent'

export default function AddStudentModal() {

    const [showModal, setShowModal] = useState(false)


    return (
    <>
        <button onClick={()=>setShowModal(true)}>
            New Student
        </button>
        {showModal && createPortal(<AddStudentModalContent onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}