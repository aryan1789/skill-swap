import React, { useEffect, useState } from "react";
import { getUsers } from "../api/userService";

const SkillSwap: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        getUsers()
            .then((data) => {
                console.log("Fetched users:", data);
                setUsers(data);
            })
            .catch((error) => {
                console.error('Failed to fetch users:', error)
            });
    }, []);
    return (
        <div style={styles.container}>
            <h2>SkillSwap</h2>
            <div style={styles.cardGrid}>
                {users.map((user) => (
                    <div key={user.id} style={styles.card}>
                        <h3>{user.name}</h3>
                        <p><i>{user.bio}</i></p>
                        <div style={styles.skillList}>
                            {user.userSkills?.map((us: any) => (
                                <span key={us.skill.id} style={styles.skillBadge}>
                                    {us.skill.name}
                                </span>
                            ))}
                        </div>
                        <div style={styles.buttonRow}>
                            <button style={styles.button} onClick={() => window.location.href = `/profile?id=${user.id}`}>View Profile</button>
                            <button style={styles.swapButton} onClick={() => alert(`Swap request sent to ${user.name}`)}>Swap Skills</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        paddingTop: "80px",
        padding: "2rem",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem",
    },
    card: {
        background: "#fff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    skillList: {
        margin: "0.5rem 0",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
    },
    skillBadge: {
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
    button: {
        flex: 1,
        backgroundColor: "#eee",
        border: "none",
        padding: "0.5rem",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
    },
    swapButton: {
        flex: 1,
        backgroundColor: "#0077cc",
        color: "white",
        border: "none",
        padding: "0.5rem",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
    },
};

export default SkillSwap;