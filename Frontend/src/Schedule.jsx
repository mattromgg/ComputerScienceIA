import Slot from './Slot'
import {useState, useEffect} from 'react'
import './styles/Schedule.css'

//Room 1: 8 students max
//Room 2: 24
//Room 3: 

export default function Schedule() {

    function createSlot(scheduleClassID, teacherName, className, startTime, endTime, isStart, color) {
        return {scheduleClassID, teacherName, className, startTime, endTime, isStart, color}
    }


    const rows = 7;
    const cols = 25;
    const timeSlots = new Array(rows).fill().map(() => new Array(cols).fill(createSlot()));



    const [slots, setSlots] = useState(timeSlots);

    const [currentRoom, setCurrentRoom] = useState(1);
     


 
    const slotRows = slots.map((slotRow, rowIndex) => {
        const slotRowData = slotRow.map((slot, slotIndex) => {
            console.log(slot)
            return <Slot onUpdate={() => onUpdateSchedule()} key={`${rowIndex}` + `${slotIndex}`} content={slot} row={rowIndex} />
        })
        return <div key={rowIndex} className="slotRow">{slotRowData}</div>
    })

    function placeSlot(day, startTime, endTime, scheduleClassID, firstName, lastName, className, color) {
        setSlots((prevSlots) => {
            const updatedSlots = prevSlots.map((slotRow, rowIndex) => {
                if(rowIndex === day) {
                    return slotRow.map((timeSlot, slotIndex) => {
                        const teacherName = firstName + " " + lastName
                        if (slotIndex === startTime) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, 1, color)      
                        }else if(slotIndex === endTime - 1) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, -1, color)
                        }else if (slotIndex > startTime && slotIndex < endTime - 1) {
                            return createSlot(scheduleClassID, teacherName, className, startTime, endTime, 2, color)
                        }
                        return timeSlot;
                    })
                }
                return  slotRow
            })
            return updatedSlots
        })
    }

    useEffect(()=> {
        async function getSchedule() {
            try {
                console.log("im trying to fetch data")
                const res = await fetch('http://localhost:8081/ScheduleData')
                const data = await res.json()

                console.log(data)
                data.forEach(currSlot => {
                    if(currSlot.room == currentRoom) {
                        placeSlot(currSlot.day, currSlot.startTime, currSlot.endTime, currSlot.scheduleClassID, currSlot.firstName, currSlot.lastName, currSlot.name, currSlot.color)
                    }
                })
            } catch (error) {
                console.error("Error fetching Schedule Data : ", error)
            }
        }

        getSchedule();
    }, [currentRoom])

    async function onUpdateSchedule() {
        try {
            console.log("im trying to fetch data")
            const res = await fetch('http://localhost:8081/ScheduleData')
            const data = await res.json()

            setSlots((prevSlots) => {
                const updatedSlots = prevSlots.map((slotRow, rowIndex) => {
                    const updatedSlotRow = slotRow.map(() => createSlot());

                    data.forEach(currSlot => {
                        if (currSlot.room == currentRoom && currSlot.day === rowIndex) {
                            const teacherName = currSlot.firstName + " " + currSlot.lastName;
                            for (let i = currSlot.startTime; i < currSlot.endTime; i++) {
                                let isStart = 0;
                                if (i === currSlot.startTime) {
                                    isStart = 1;
                                } else if (i === currSlot.endTime - 1) {
                                    isStart = -1;
                                } else {
                                    isStart = 2;
                                }
                                updatedSlotRow[i] = createSlot(
                                    currSlot.scheduleClassID,
                                    teacherName,
                                    currSlot.name,
                                    currSlot.startTime,
                                    currSlot.endTime,
                                    isStart,
                                    currSlot.color
                                );
                            }
                        }
                    });
                    return updatedSlotRow;
                });
                return updatedSlots;
        })} catch (error) {
            console.error("Error fetching Schedule Data : ", error)
        }
    }

    function changeRoom(roomNumber) {
        setSlots(timeSlots)
        console.log("hello")
        setCurrentRoom(roomNumber)
    }

    return (
        <>  
            <select value={currentRoom} onChange={(e) => changeRoom(e.target.value)} className="room-select">
                <option value={1}>Room 1</option>
                <option value={2}>Room 2</option>
                <option value={3}>Room 3</option>
            </select>
            <div className='schedule'>
                <div className='item'></div>
                <div className='days-wrapper item'>
                    <div className='days'>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                        <div>Sun</div>
                    </div>
                </div>
                <div className='times-wrapper item'>
                    <div className='times'>
                        <div>10:00</div>
                        <div>10:30</div>
                        <div>11:00</div>
                        <div>11:30</div>
                        <div>12:00</div>
                        <div>12:30</div>
                        <div>13:00</div>
                        <div>13:30</div>
                        <div>14:00</div>
                        <div>14:30</div>
                        <div>15:00</div>
                        <div>15:30</div>
                        <div>16:00</div>
                        <div>16:30</div>
                        <div>17:00</div>
                        <div>17:30</div>
                        <div>18:00</div>
                        <div>18:30</div>
                        <div>19:00</div>
                        <div>19:30</div>
                        <div>20:00</div>
                        <div>20:30</div>
                        <div>21:00</div>
                        <div>21:30</div>
                        <div>22:00</div>
                    </div>
                </div>
                <div className='grid-wrapper item'>
                    <div className='grid'>
                        {slotRows}
                    </div>
                </div>
            </div> 


        </>

        
    )
}

