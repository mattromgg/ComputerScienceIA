import './styles/Slot.css'
import {useState} from 'react'
import {createPortal} from 'react-dom'
import ClassInfoModalContent from './ClassInfoModalContent'

export default function Slot(props) {
    const slotData = props.content

    const [showModal, setShowModal] = useState(false)

    function handleClick() {
        setShowModal(true)
    }

    function checkStart(slotData){
        if(slotData.isStart === 1) {
            return <div onClick={handleClick} style={{backgroundColor: slotData.color, borderRight: "none"}} className='slot'>{slotData.className}</div>
        }else if (slotData.isStart === -1) {
            return <div style={{backgroundColor: slotData.color, borderLeft: "none"}} className='slot'>{}</div>
        }else if(slotData.isStart === 2) {
            return <div style={{backgroundColor: slotData.color, borderLeft: "none", borderRight: "none"}} className='slot'>{}</div>
        }else {
            return <div className='slot'>{slotData.className}</div>
        }
    }


    return (
        <>
            {checkStart(slotData)}
            {showModal && createPortal(<ClassInfoModalContent onUpdate={() => props.onUpdate()} classInfo={slotData} onClose={() => setShowModal(false)} />, document.body)}
        </>
    )
}