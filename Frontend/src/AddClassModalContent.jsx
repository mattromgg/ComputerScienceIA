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
            <select className="start-time"  onChange={(e) => updateStartTime(e.target.value, index)}>
                <option value="-1">Start</option>
                {timeOptions}
            </select>

            <select className="end-time" onChange={(e) => updateEndTime(e.target.value, index)}>
                <option value="100">End</option>
                {timeOptions}
            </select>
        </div>
    ))


    function updateStartTime(value, index) {
        setFormData(prevFormData => {
            const newStartTime = parseInt(value, 10);
            const newSchedule = [...prevFormData.schedule];

            newSchedule[index] = { ...newSchedule[index], startTime: newStartTime };

            if (newStartTime >= newSchedule[index].endTime && newSchedule[index].endTime !== 100) {
                console.log(`Warning: Start time (${newStartTime}) should be less than end time (${newSchedule[index].endTime})`);
                // You could add additional UI feedback here
            }

            return { ...prevFormData, schedule: newSchedule };
        })
    }

    function updateEndTime(value, index) { 
        setFormData((prevFormData) => {
            const newEndTime = parseInt(value, 10);
            const newSchedule = [...prevFormData.schedule];
            
            // Always update the value, but add validation feedback if needed
            newSchedule[index] = { ...newSchedule[index], endTime: newEndTime };
            
            if (newEndTime <= newSchedule[index].startTime && newSchedule[index].startTime !== -1) {
                console.log(`Warning: End time (${newEndTime}) should be greater than start time (${newSchedule[index].startTime})`);
                // You could add additional UI feedback here
            }
            
            return { ...prevFormData, schedule: newSchedule };
        });
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

        const newClassDays = formData.schedule.filter((day) => day.endTime < 100 && day.startTime > -1)

        for (const newClassDay of newClassDays) {
            for (const prevDay of data) {
                if (newClassDay.id === prevDay.day) {
                    const newStart = newClassDay.startTime;
                    const newEnd = newClassDay.endTime;
                    const prevStart = prevDay.startTime;
                    const prevEnd = prevDay.endTime;
                    if ((newStart >= prevStart && newStart < prevEnd) ||
                        (newEnd > prevStart && newEnd <= prevEnd) ||
                        (newStart <= prevStart && newEnd >= prevEnd)){
                            console.log(`Time Conflict on ${newClassDay.dayName} from ${prevStart} to ${prevEnd}`)
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

        console.log(formData.schedule)

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