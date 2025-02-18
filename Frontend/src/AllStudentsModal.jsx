import './styles/Modal.css'
import {useState} from 'react'
import {createPortal} from 'react-dom'
import AllStudentsModalContent from './AllStudentsModalContent'

export default function AllStudentsModal() {

    const [showModal, setShowModal] = useState(false)


    return (
    <>
        <button onClick={()=>setShowModal(true)}>
            All Students
        </button>
        {showModal && createPortal(<AllModalContent onClose={() => setShowModal(false)} />, document.body
        )}
    </>
    ) 
}