import {useState, useEffect} from 'react'

const initialSchedule = [
    {id: 0, dayName: 'Mon', startTime: -1, endTime: 100}, 
    {id: 1, dayName: 'Tue', startTime: -1, endTime: 100},
    {id: 2, dayName: 'Wed', startTime: -1, endTime: 100},
    {id: 3, dayName: 'Thu', startTime: -1, endTime: 100},
    {id: 4, dayName: 'Fri', startTime: -1, endTime: 100},
    {id: 5, dayName: 'Sat', startTime: -1, endTime: 100},
    {id: 6, dayName: 'Sun', startTime: -1, endTime: 100}

]


export default function AddClassModalContent({onClose}) {

    const [teacherOptions, setTeacherOptions] = useState([])

    useEffect(() => {
        async function getTeachers() {
            try {
                const res = await fetch('http://localhost:8081/getTeachers');
                const data = await res.json();
                
                console.log(data)
                const teachers = data.map((teacher) => (
                    {
                        teacherID: teacher.teacherID,
                        teacherName:  `${teacher.firstName} ${teacher.lastName}`,
                    }
                ))
                console.log(teachers)

                setTeacherOptions(
                    teachers.map((teacher, index) => (
                        <option key={index} value={teacher.teacherID}>
                            {teacher.teacherName}
                        </option>
                    ))
                )
            
            }catch (error){
                console.log("Error fetching Teachers Data: " + error)
            }
        }

        getTeachers();
    }, [])

    const times = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]

    const [formData, setFormData] = useState({
        name: "",
        teacher: "",
        room: 1,
        color: "",
        schedule: initialSchedule
    });

    function handleChange(event) {
        setFormData((prevFormData) => ({
                ...prevFormData,
                [event.target.name]: event.target.value
        }))
    }

    const timeOptions = times.map((time, index) => (
        <option key={index} value={index}>
            {time}
        </option>
    ))

    const daySelections = formData.schedule.map((day, index) => (
        <div className='day' key={index}>
            <div>{day.dayName}</div>
            <select className="start-time"  onChange={(e) => updateStartTime(day, e.target.value, index)}>
                <option value="-1">Start</option>
                {timeOptions}
            </select>

            <select className="end-time" onChange={(e) => updateEndTime(day, e.target.value, index)}>
                <option value="100">End</option>
                {timeOptions}
            </select>
        </div>
    ))

    function updateStartTime(dayObject, value, index) {
        if (parseInt(value, 10) < parseInt(dayObject.endTime, 10)){
            console.log(`StartTimeValue: ${value} is smaller than End Time: ${dayObject.endTime} ...Correct!`)
            setFormData((prevFormData) => {
                return ({
                ...prevFormData,
                schedule: prevFormData.schedule.map((day, dayIndex) => {
                    if (index === dayIndex) {
                        return {
                            ...prevFormData.schedule[index],
                            startTime: parseInt(value,10)
                        }
                    }else {
                        return day;
                    }
                })
                })
            })
        }else {
            console.log(`StartTimeValue: ${value} is bigger or equals than End Time: ${dayObject.endTime} ...Incorrect`)
            setFormData((prevFormData)=> {
                return ({...prevFormData})
            })
        }
    }

    function updateEndTime(dayObject, value, index) { 
        if(parseInt(value, 10) > parseInt(dayObject.startTime, 10)) {
            console.log(`EndTimeValue: ${value} is larger than Start Time: ${dayObject.startTime} ...Correct!`)
            setFormData((prevFormData) => {
                return({ 
                ...prevFormData,
                schedule: prevFormData.schedule.map((day, dayIndex) => {
                    if (index === dayIndex) {
                        return {
                            ...prevFormData.schedule[index],
                            endTime: parseInt(value,10)
                        }
                    }else {
                        return day;
                    }
                })
                })
            })
        }else {
            console.log(`EndTimeValue: ${value} is smaller or equals than Start Time: ${dayObject.startTime} ...Incorrect`)
            setFormData((prevFormData)=> {
                return ({...prevFormData})
            })
        }
    }

    function formIsValid() {
        let isValid = true;
        let emptyCount = 0;

        formData.schedule.forEach((day) => {
            if(day.startTime === -1 && day.endTime === 100) {
                emptyCount++;
            }else if (day.startTime !== -1 && day.endTime === 100) {
                console.log("The End Time for " + day.dayName + " is missing")
                isValid = false;
                return 0
            }else if (day.startTime === -1 && day.endTime !== 100) {
                console.log("The Start Time for " + day.dayName + " is missing")
                isValid = false;
                return 0
            }
        })
        if (emptyCount === 7){
            console.log("You must have at least one slot entry.")
            isValid = false;
        }

        return isValid;
    }


    async function checkSpace() {
        const res = await fetch(`http://localhost:8081/getSchedule/${formData.room}`)
        const data = await res.json()

        console.log(data)


        const newClassDays = formData.schedule.filter((day, index) => day.endTime < 100 && day.startTime > -1)

        for (const newClassDay of newClassDays) {
            for (const prevDay of data) {
                if (newClassDay.id === prevDay.day) {
                    console.log("im aknowledging thoo")
                    console.log(newClassDay.startTime <= prevDay.startTime && newClassDay.endTime > prevDay.endTime)
                    console.log(newClassDay.endTime >= prevDay.endTime && newClassDay.startTime < prevDay.startTime)
                    console.log(newClassDay.startTime <= prevDay.startTime && newClassDay.endTime >= prevDay.endTime)
                    if ((newClassDay.startTime <= prevDay.startTime && newClassDay.endTime > prevDay.endTime) ||
                        (newClassDay.endTime >= prevDay.endTime && newClassDay.startTime < prevDay.startTime) ||
                        (newClassDay.startTime <= prevDay.startTime && newClassDay.endTime >= prevDay.endTime)){
                            console.log("Chop that rnnn")
                            return false;
                            
                    }
                }
            }
        }
        console.log("Nah u good add that class, good boy")
        return true
    }

    async function addClassToDB(event) {
        event.preventDefault();

        const isAvailable = await checkSpace()
        

        if (formIsValid() && isAvailable) {
            console.log("This is the data that will be sent:")
            console.log(formData)
            try {
                const res = await fetch(`http://localhost:8081/postClass`, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify(formData)
            
                })
                if (res.ok) {
                    console.log("we got the res")
                    setFormData({name: "", teacher: "", room: 1, schedule: initialSchedule})
                    setTeacherOptions([])
                    onClose()
                    window.location.reload();
                    alert("Class Has been Successfully Added")
                }else {
                    alert('Error In Adding Class');
                }       
            } catch (err) {
                console.error('Error:' + err) 
            }
        }else {
            console.log("Schedule is not ready yet.")
        }


    }


    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <form className="classModalForm" onSubmit={addClassToDB}>

                <div className="modal-title">New Class</div>
                <div>
                    <label>Class Name</label>
                    <input value={formData.name} name="name" onChange={handleChange} required={true}/>
                </div>
                <div className='teacher-select'>
                    <label>Teacher</label>
                    <select value={formData.teacher} name="teacher" onChange={handleChange} required={true}>
                        <option value="">~</option>
                        {teacherOptions}
                    </select>
                </div>
                <div className='room-select'>
                    <label>Room</label>
                    <select value={formData.room} name="room" onChange={handleChange} required={true}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select>
                </div>

                <div className="day-options">
                    {daySelections}
                </div>

                <div>
                    <label>Colour</label>
                    <input type="color" name="color" onChange={handleChange} required={true}/>
                </div>

                <button type="submit">Create</button>
            </form>
            <button className="close-btn" onClick={onClose}>×</button> 
        </div>
    </div>
    )
}