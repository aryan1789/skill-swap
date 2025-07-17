import React, { useEffect, useState } from "react";
import { getUsers } from "../api/userService";
import SearchBar from "../components/SearchBar";
import { getSSReqs } from "../api/skillSwapService";

const SkillSwap: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [isSending, setIsSending] = useState(false);

    //Fetches users
    useEffect(() => {
        getUsers()
            .then((data) => {
                console.log("Fetched users:", data);
                setUsers(data);
                setFilteredUsers(data);
            })
            .catch((error) => {
                console.error("Failed to fetch users:", error);
            });
    }, []);

    // Handles the search functionality further filtering based on filter selected
    const handleSearch = (filterBy: "name" | "occupation", query: string) => {
        const lowerQuery = query.toLowerCase();
        const filtered = users.filter((user) =>
            user[filterBy]?.toLowerCase().includes(lowerQuery)
        );
        setFilteredUsers(filtered);
    };

    //Sorts the users based on the filter and ascending/descending option selected
    const handleSort = (sortBy: string) => {
        const sorted = [...filteredUsers];
        switch (sortBy) {
            case "name-asc":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "occupation-asc":
                sorted.sort((a, b) => a.occupation?.localeCompare(b.occupation));
                break;
            case "occupation-desc":
                sorted.sort((a, b) => b.occupation?.localeCompare(a.occupation));
                break;
            case "date-newest":
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "date-oldest":
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
        }
        setFilteredUsers(sorted);
    };

    //Handles the skill swap functionality - finds requesting user / logged in user and target user, 
    // checks everything's fine with error handling,
    // Sends a swap request registering in frontend and backend
    const handleSkillSwap = async (targetUser: any) => {
    const requesterId = localStorage.getItem("userId");
    if (!requesterId) {
        alert("You must be logged in to swap skills.");
        return;
    }

    
    const requesterById = users.find(u => u.id.toString() === requesterId);
    const requesterBySupabaseId = users.find(u => u.supabaseUserId === requesterId);
    
    const requester = requesterById || requesterBySupabaseId;
        
    if (!requester) {
        alert("Could not find your user profile. Please try logging in again.");
        return;
    }
    
    // Get offered skill from requester (what they can teach - skillType 1)
    const offeredSkill = requester.userSkills?.find((s: any) => s.skillType === 1);
    
    // Get requested skill from target user (what they can teach - skillType 1)
    const requestedSkill = targetUser.userSkills?.find((s: any) => s.skillType === 1);

    console.log("Requester skills:", requester.userSkills);
    console.log("Target user skills:", targetUser.userSkills);
    console.log("Offered Skill:", offeredSkill);
    console.log("Requested Skill:", requestedSkill);

    if (!offeredSkill) {
        alert("You must have a skill to offer for swapping. Please add an offered skill to your profile.");
        return;
    }
    
    if (!requestedSkill) {
        alert(`${targetUser.name} doesn't have any skills to offer for swapping.`);
        return;
    }

    try {
        setIsSending(true);
        const response = await getSSReqs({
            requesterId: requester.id, // Use the actual user ID, not the supabaseUserId
            targetUserId: targetUser.id,
            offeredSkillId: offeredSkill.id,
            requestedSkillId: requestedSkill.id,
        });
        console.log("Swap request sent:", response);
        alert(`Swap request sent to ${targetUser.name}!`);
    } catch (err) {
        console.error("Error sending swap request:", err);
        alert("Failed to send swap request. Please try again.");
    } finally {
        setIsSending(false);
    }
};

    return (
        <div style={styles.container}>
            <h2>SkillSwap</h2>
            <div style={styles.searchWrapper}>
                <SearchBar
                    onSearch={handleSearch}
                    onSort={handleSort}
                    hasResults={filteredUsers.length > 0}
                    totalItems={filteredUsers.length}
                />
            </div>
            <div style={styles.contentArea}>
                <div style={styles.cardGrid}>
                    {filteredUsers.map((user) => (
                        <div key={user.id} style={styles.card}>
                            <img
                                src={user.profilePicture || "Default_pfp.jpg"}
                                alt={`${user.name}'s profile`}
                                style={{ width: "100%", borderRadius: "12px" }}
                            />
                            <h3>{user.name}</h3>
                            <p><i>{user.occupation}</i></p>
                            <p>
                                Member since{" "}
                                {new Date(user.createdAt).toLocaleDateString("en-NZ", {
                                    year: "numeric", month: "long", day: "numeric"
                                })}
                            </p>
                            <div style={styles.skillList}>
                                {user.userSkills?.map((us: any, index: number) => (
                                    <span key={`${user.id}-${us.skill.id}-${index}`} style={styles.skillBadge}>
                                        {us.skill.skillName}
                                    </span>
                                ))}
                            </div>
                            <div style={styles.buttonRow}>
                                <button
                                    style={styles.button}
                                    onClick={() =>
                                        (window.location.href = `/viewprofile?id=${user.supabaseUserId}`)
                                    }
                                >
                                    View Profile
                                </button>
                                <button
                                    style={styles.swapButton}
                                    onClick={() => handleSkillSwap(user)}
                                >
                                    {isSending ? "Sending..." : "Swap Skills"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { paddingTop: "80px", paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "2rem", margin: "0 auto", width: "100%" },
    searchWrapper: { marginBottom: "1.5rem" },
    contentArea: { minWidth: "60vw", minHeight: "100vh" },
    cardGrid: { display: "grid", width: "100%", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", minHeight: "300px" },
    card: { background: "#fff", color: "#111827", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: "Inter, sans-serif" },
    skillList: { margin: "0.5rem 0", display: "flex", flexWrap: "wrap", gap: "0.5rem" },
    skillBadge: { margin: "0 auto", background: "#e0f2ff", color: "#0077cc", padding: "0.3rem 0.6rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 },
    buttonRow: { marginTop: "1rem", display: "flex", justifyContent: "space-between", gap: "0.5rem" },
    button: { flex: 1, backgroundColor: "#4a4949", color: "white", border: "none", padding: "0.5rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 },
    swapButton: { flex: 1, backgroundColor: "#0077cc", color: "white", border: "none", padding: "0.5rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 },
    noUsersMessage: { gridColumn: "1 / -1", textAlign: "center", padding: "2rem", fontSize: "1.2rem", color: "#6b7280", minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center" }
};

export default SkillSwap;