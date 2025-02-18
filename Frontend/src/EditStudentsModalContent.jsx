import {useState, useEffect} from 'react'


export default function EditStudentsModalContent(props) {

    const [studentsTakingClass, setStudentsTakingClass] = useState(props.students)
    const [studentsTakingID, setStudentsTakingID] = useState(studentsTakingClass.map(student => {return student.studentID}))

    console.log("Original: " + studentsTakingID)


    function sortStudents(arr) {
        arr.sort((a,b) => {
            const nameA = a.firstName.toUpperCase() + a.lastName.toUpperCase();
            const nameB = b.firstName.toUpperCase() + b.lastName.toUpperCase();
        
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })
        return arr
    }

    const [studentsStatus, setStudentsStatus] = useState([])


    useEffect(() => {
        async function getStudents() {
            const res = await fetch('http://localhost:8081/getStudents')
            const data = await res.json()

            const sortedData = sortStudents(data)

            setStudentsStatus(sortedData.map(student => {
                return {
                    studentID: student.studentID,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    email: student.email,
                    isTaking: studentsTakingID.includes(student.studentID)
                }
            }))
        }

        getStudents()
    }, [])

    useEffect(() => {
        // This will log the updated classData once it has been set
        //console.log(studentsStatus);
    }, [studentsStatus]);

    function updateTakingStatus(student) {
        setStudentsStatus(prevStudentsStatus => {
            return (prevStudentsStatus.map(prevStudent => {
                if (prevStudent.studentID === student.studentID) {
                    return {
                        ...student,
                        isTaking: !(student.isTaking)
                    }
                }else {
                    return {...prevStudent}
                }
            }))
        })
    }

    const editStudentEntries = studentsStatus.map((student, index) => {
        return <div key={index} className="edit-student-entry">
            {student.isTaking ? <div><input type="checkbox" checked={true} onChange={() => updateTakingStatus(student)}/></div> : <div><input type="checkbox" checked={false} onChange={() => updateTakingStatus(student)}/></div>}
            <div>{student.firstName}</div>
            <div>{student.lastName}</div>
            <div>{student.email}</div>
        </div>
    })

    async function updateClassesTaken() {
        const currentStudentsTaking = studentsStatus.filter(student => student.isTaking)
        const currentStudentsTakingIDs = currentStudentsTaking.map(student => student.studentID)
        console.log(currentStudentsTakingIDs)

        const studentsToAdd = currentStudentsTakingIDs.filter(studentID => !(studentsTakingID.includes(studentID)))
        const studentsToRemove = studentsTakingID.filter(studentID => !(currentStudentsTakingIDs.includes(studentID)))

        console.log("To add: " + studentsToAdd)
        console.log("To remove: " + studentsToRemove)

        const requestBody = {studentsToAdd: studentsToAdd, studentsToRemove: studentsToRemove, classID: props.class}

        const res = await fetch('http://localhost:8081/postClassesTaken', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(requestBody)
        })
        if (res.ok) {
            console.log(res.message)
            props.onClose()
            props.onStudentsUpdated();
        }else {
            console.log("theres been an error")
        }
        
    }
 
    return (
    <div className="modalContainer">
        <div className="modalContentWrapper">
            <div className="modal-content">
                <div className='modal-title'>Student List</div>
                <div style={{display: 'grid', gridAutoRows: '2rem'}} className='modal-allstudents'>
                    <div className='edit-student-entry edit-student-title'>
                        <div>Select</div>
                        <div>First Name</div>
                        <div>Last Name</div>
                        <div>Email</div>
                    </div>
                    {editStudentEntries}
                </div>
                <div className='update-btn-container'><button onClick={() => updateClassesTaken()} className="update-students-btn">Update Student List</button></div>
            </div>
            <button className="close-btn" onClick={props.onClose}>×</button> 
        </div>
    </div>
    )
}