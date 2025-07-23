import React from "react";
import { useEffect, useState } from "react";
import { updateUserProfile,getUserBySupabaseId } from "../api/userService";
import "../UserProfile.css"; 
import { useNavigate } from "react-router-dom";

const UserProfile: React.FC = () => {

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [email, setEmail] = useState("");
  //const [occupation, setOccupation] = useState("");
  const [password, setPassword] = useState("");
  const supabaseUid = localStorage.getItem("supabaseUid") ?? "";
  const navigate = useNavigate();
  //const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    if (!supabaseUid) return;
    getUserBySupabaseId(supabaseUid)
      .then((data) => {
        setUser(data);
        setName(data.name);
        setBio(data.bio ?? "");
        setIsAvailable(data.isAvailable ?? true);
        setEmail(data.email);
        //setProfilePicUrl(data.profilePicUrl || "");
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, [supabaseUid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert("User ID not found");
      return;
    }
    console.log("Updating user profile with:", {
  name,
  bio,
  isAvailable,
  email,
  password
});

    await updateUserProfile(user.id, {
      name,
      bio,
      isAvailable,
      email,
      password:"",
      //profilePicUrl:user?.profilePicUrl ?? null,
    });
    alert("Profile Updated!");
    setTimeout(() => navigate("/skillswap"),1500);

  };


  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setProfilePicUrl(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  if (!user) return <p>Loading Profile...</p>;

  return (
    <div className="profile-card">
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
  <div className="form-group">
    <label>Name</label>
    <input
      className="form-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Email</label>
    <input
      className="form-input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Change Password</label>
    <input
      className="form-input"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Bio</label>
    <textarea
      className="form-input"
      rows={3}
      value={bio}
      onChange={(e) => setBio(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>
      <input
        type="checkbox"
        checked={isAvailable}
        onChange={(e) => setIsAvailable(e.target.checked)}
      />{" "}
      Available for SkillSwap
    </label>
  </div>
  {/* <label>Profile Picture: </label>
        <br />
        <input
          type="file"
          onChange={handleFileChange}
        />
        <br />
        <br /> */}
  <div className="form-actions">
    <button type="submit" className="save-button">Save Changes</button>
  </div>
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