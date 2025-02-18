import {useState} from 'react'


export default function AllStudentsModalContent({onClose}) {
 
    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <div className="modal-content">
                <div className='modal-title'>All Students</div>
                
            </div>
            <button className="close-btn" onClick={onClose}>×</button> 
        </div>
    </div>
    )
}