import React from "react";
import { useEffect,useState } from "react";
import { getUserById,updateUserProfile } from "../api/userService";

const UserProfile: React.FC = () => {
const userId = new URLSearchParams(window.location.search).get("id") || "";

const [user,setUser] = useState<any>(null);
    const [name,setName] = useState("");
    const [bio,setBio] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    useEffect(() => {
        getUserById(userId)
        .then((data) => {
            setUser(data);
            setName(data.name);
            setBio(data.bio);
            setIsAvailable(data.isAvailable);
            setEmail(data.email);
            setPassword(data.password);
        })
        .catch((err) => console.error("Failed to load user:",err));
    },[userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUserProfile(userId,{name,bio,isAvailable,email,password});
        alert("Profile Updated!");
    };

    if(!user) return <p>Loading Profile...</p>

     return (
    <div style={{ paddingTop:"70px",padding: "2rem" }}>
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Name: </label><br />
        <input value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
        <label>Email: </label><br />
        <input value={email} onChange={(e) => setEmail(e.target.value)} /><br /><br />
        <label>Change Password: </label><br />
        <input value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
        <label>Bio: </label><br />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} /><br /><br />

        <label>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />{" "}
          Available for SkillSwap
        </label><br /><br />

        <button type="submit">Save Changes</button>
      </form>
      {user.userSkills?.length > 0 ? (
  <div>
    <h3>Skills</h3>
    <ul>
      {user.userSkills.map((us: any) => (
        <li key={us.skill.id}>{us.skill.skillName}</li>
      ))}
    </ul>
  </div>
) : (
  <p>No skills listed</p>
)}
    </div>
  );
};

export default UserProfile;