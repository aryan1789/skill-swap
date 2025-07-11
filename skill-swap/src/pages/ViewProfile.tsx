import React from "react";
import { useEffect,useState } from "react";
import { getUserById } from "../api/userService";

const ViewProfile: React.FC = () => {
const userId = new URLSearchParams(window.location.search).get("id") || "";

const [user,setUser] = useState<any>(null);

    useEffect(() => {
        getUserById(userId)
        .then((data) => {
            setUser(data);
        })
        .catch((err) => console.error("Failed to load user:",err));
    },[userId]);

    if(!user) return <p>Loading Profile...</p>
    const joinedDate = new Date(user.createdAt);
const formattedDate = joinedDate.toLocaleDateString("en-NZ", {
  year: "numeric",
  month: "long"
});
    
     return (
    <div style={{ paddingTop:"70px",padding: "2rem" }}>
      <h2>{user.name}'s Profile</h2>
      <div key={user.id} style={styles.card}>
                        <img src={user.profilePicture || "Default_pfp.jpg"} alt={`${user.name}'s profile`} style={{ width: "100%", borderRadius: "12px" }} />
                        <h3>{user.name}</h3>
                        <p><i>{user.occupation}</i></p>
                        <p><i>{user.bio}</i></p>
                        <p>Member since {formattedDate}</p>
                        <div style={styles.skillList}>
                            {user.userSkills?.map((us: any) => (
                                <span key={us.skill.id} style={styles.skillBadge}>
                                    {us.skill.skillName}
                                </span>
                            ))}
                        </div>
                        
                    </div>
    </div>
     )};
const styles: { [key: string]: React.CSSProperties } = {

     card: {
        background: "#fff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        color: "black",
        maxWidth: "400px",
    },
    skillList: {
        margin: "0.5rem 0",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
    },
    skillBadge: {
        margin: "0 auto",
        background: "#e0f2ff",
        color: "#0077cc",
        padding: "0.3rem 0.6rem",
        borderRadius: "20px",
        fontSize: "0.8rem",
        fontWeight: 600,
    },
    buttonRow: {
        marginTop: "1rem",
        display: "flex",
        justifyContent: "space-between",
        gap: "0.5rem",
    },
}


export default ViewProfile;