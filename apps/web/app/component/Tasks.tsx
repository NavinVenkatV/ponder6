import axios from 'axios';
import React, { useEffect, useState } from 'react'


function Tasks() {
    const [ tasks, setTasks ] = useState([]);
    useEffect(()=>{
        const pastTasks = async () => {
            try { 
                const taskList = await axios.get('/tasks')
                console.log(taskList.data.tasks)
                setTasks(taskList.data.tasks)
            }catch(e){
                alert("something went wrong")
                console.log("Error fetching tasks ", e)
            }
        }
        pastTasks();
    },[])

  return (
    <div className='text-5xl text-red-700'>
      {tasks}
    </div>
  )
}

export default Tasks
