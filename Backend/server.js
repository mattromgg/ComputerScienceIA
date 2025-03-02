const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser')





const app = express();
app.use(bodyParser.json());
app.use(cors())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'csia',
    password: 'Computer',
    database: 'admin_panel'
})

app.get('/', (re, res) => {
    return res.json("Hello This is the start of your journey here in the ohm admin panel")
})

app.get('/ScheduleData', (req, res) => {
    console.log("Schedule query") // Message used to verify that http request is recieved by server
    // SQL query fetches all schedule data, including the details of each class and the details of its teacher
    const sql = `SELECT Schedule.* , Classes.*, Teachers.*
                 FROM Schedule
                 INNER JOIN Classes ON Schedule.scheduleClassID = Classes.classID
                 INNER JOIN Teachers ON Classes.teacherID = Teachers.teacherID
                `
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err); //Handle db error with suitable error code
        return res.json(data); //Send data to frontend
    })
})

app.get('/getSchedule/:room', (req, res) => {
    console.log("Schedule query")
    const {room} = req.params
    const sql = `SELECT Schedule.* 
                 FROM Schedule
                 WHERE Schedule.room = ?
                `
    db.query(sql, [room], (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/getTeachers', (req, res) => {
    console.log("Teacher query")
    const sql = `SELECT *
                 FROM Teachers
                `
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/getClassInfo/:classID',(req, res) => {
    console.log('Class Info GET...')
    console.log(req.params)
    const {classID} = req.params

        const scheduleQuery = `
            SELECT Schedule.*
            FROM Schedule
            WHERE Schedule.scheduleClassID = ?;
        `;

        const studentQuery = `
            SELECT Students.*
            FROM Students
            JOIN ClassesTaken ON Students.studentID = ClassesTaken.takenStudentID
            WHERE ClassesTaken.takenClassID = ?
        `

        db.query(scheduleQuery, [classID], (err1, scheduleResult) => {
            if (err1) return res.status(500).json({ error: 'Database query failed'});

            db.query(studentQuery, [classID], (err2, studentResult)=> {
                if (err2) return res.status(500).json({error: 'Database query failed'});
                res.json({
                    scheduleEntries: scheduleResult,
                    students: studentResult
                });
            })
        });
})

app.get('/getStudents', (req, res) => {
    console.log('Student get...')

    const sql = `SELECT Students.*
                 FROM Students            
    `

    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    })
})

app.delete('/deleteClass/:classID', (req, res) => {
    console.log("Delete Class...")
    const {classID} = req.params
    console.log(classID)

    const deleteQuery = `
    DELETE
    FROM Classes
    WHERE Classes.classID = ?;
    `;

    db.query(deleteQuery, [classID], (err, result)=> {
        if(err) return res.status(500).json(err);
        return res.json(result);
    })
})

app.post('/postStudent', (req, res) => {
    console.log("Student post...")
    console.log(req.body)

    //  SQL query - Alters Students table
    const sql = "INSERT INTO Students (firstName, lastName, email) VALUES (?,?,?)"

    //SQL query takes parameters from the body of the HTTP request which are in the form of JSON.
    db.query(sql, [req.body.firstName, req.body.lastName, req.body.email], (err, result) => {
        //Tests whether record is inserted
        if (err) return res.status(500).json(err);
        console.log("1 Student record inserted");
        console.log(result)
        return res.json(result)

    })
                                                                                      
})

app.post('/postTeacher', (req, res) => {
    console.log("Teachers post...")
    console.log(req.body)

    const sql = "INSERT INTO Teachers (firstName, lastName, email) VALUES (?,?,?)"
    db.query(sql, [req.body.firstName, req.body.lastName, req.body.email], (err, result) => {
        if(err) return res.json(err);
        console.log("1 Teacher Record inserted")
        console.log(result)
        return res.json(result);
    })
})


app.post('/postClass', (req, res) => {
    console.log("Class Post...");
    console.log(req.body);

    const classContent = {
        name: req.body.name,
        teacherID: req.body.teacher,
        color: req.body.color
    };

    console.log(classContent);

    const classSQL = "INSERT INTO Classes (name, teacherID, color) VALUES (?,?,?)";

    db.query(classSQL, [classContent.name, classContent.teacherID, classContent.color], (err, result) => {
        if (err) return res.status(500).json(err); // Important: Return error with appropriate status code
        console.log("1 Class Record inserted");
        const classInsertID = result.insertId; // Now classInsertID is correctly set

        const scheduleTimeInfo = req.body.schedule.filter((day) => day.startTime >= 0); // Simplified filter

        const scheduleSQL = "INSERT INTO Schedule (scheduleClassID, day, startTime, endTime, room) VALUES (?,?,?,?,?)";

        // Use a loop that respects asynchronous operations (e.g., for...of or Promise.all)
        let schedulePromises = scheduleTimeInfo.map(activeSlot => {
          return new Promise((resolve, reject) => {
            db.query(scheduleSQL, [classInsertID, activeSlot.id, activeSlot.startTime, activeSlot.endTime, req.body.room], (err, result) => {
              if (err) reject(err);
              else {
                console.log("1 Schedule Record inserted");
                resolve(result);
              }
            });
          });
        });

        Promise.all(schedulePromises)
          .then(results => res.json({ message: "Class and schedule inserted", classId: classInsertID, scheduleResults: results })) // Send a single response after all inserts
          .catch(err => res.status(500).json(err)); // Handle errors from schedule inserts

    });
});


app.post('/postClassesTaken', (req, res) => {
    console.log("Classes Taken POST...")
    console.log(req.body)

    const studentsToAdd = req.body.studentsToAdd;
    console.log(studentsToAdd)
    const studentsToRemove = req.body.studentsToRemove;
    const classID = req.body.classID
    
    const addStudentPromises = studentsToAdd.map(student => {
        const addSQL = "INSERT INTO ClassesTaken(takenStudentID, takenClassID) VALUES(?, ?)"
        return new Promise((resolve, reject) => {
            db.query(addSQL, [student, classID], (err, result) => {
                if(err) reject(err)
                else {
                    console.log("1 ClassesTaken record inserted")
                    resolve(result)
                }
            })
        })
    })

    const removeStudentPromises = studentsToRemove.map(student => {
        const removeSQL = `DELETE FROM ClassesTaken WHERE takenStudentID=${student} AND takenClassID=${classID}`
        return new Promise((resolve, reject) => {
            db.query(removeSQL, (err, result) => {
                if(err) reject(err);
                else {
                    console.log("1 ClassesTaken record deleted")
                    resolve(result)
                }
            })
        })
    })

    Promise.all([...addStudentPromises, ...removeStudentPromises])
    .then(results => {
        console.log("ClassesTaken table updated successfully. Results:", results);
        res.json({ message: "ClassesTaken table updated", content: results });
    })
    .catch(err => {
        console.error("Error updating ClassesTaken table:", err);
        res.status(500).json({ error: "Failed to update ClassesTaken table", details: err.message });
    })

})

app.listen(8081, () => {
    console.log("listening")
})