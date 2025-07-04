import React, { useEffect, useState } from "react";
import { getUsers } from "../api/userService"; 

const SkillSwap: React.FC = () => {
    const [users,setUsers] = useState<any[]>([]);

    useEffect(()=> {
        getUsers()
        .then((data)=> {
            console.log("Fetched users:",data);
            setUsers(data);
        })
        .catch((error)=> {
            console.error('Failed to fetch users:',error)
    });
    },[]);
    return (
        <div style={{padding:'2rem'}}>
            <h2>SkillSwap</h2>
            <ul>
                {users.map((user)=> (
                    <li key={user.id}>
                        <strong>{user.name}</strong> - {user.email}<br></br>
                        <i>{user.bio}</i>
                    </li>
                ))}
            </ul>
            <p>Find partners to exchange skills with</p>
        </div>
    );
};

export default SkillSwap;