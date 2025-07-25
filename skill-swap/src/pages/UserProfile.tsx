import React from "react";
import { useEffect, useState } from "react";
import { updateUserProfile } from "../api/userService";
import "../UserProfile.css"; 
import { useNavigate } from "react-router-dom";
import { useAuth, useAppDispatch } from "../store/hooks";
import { updateUserProfile as updateReduxProfile } from "../store/userSlice";

const UserProfile: React.FC = () => {
  // Redux hooks - get user data from store instead of API call!
  const dispatch = useAppDispatch();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Form state (these stay local as they're temporary form values)
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  console.log("UserProfile - Redux user:", currentUser);
  
  // Initialize form with Redux user data (instant loading!)
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setBio(currentUser.bio || "");
      setIsAvailable(currentUser.isAvailable ?? true);
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      alert("User ID not found");
      return;
    }
    
    try {
      console.log("Updating user profile with:", {
        name,
        bio,
        isAvailable,
        email,
        password
      });

      // Update user in database
      await updateUserProfile(currentUser.id, {
        name,
        bio,
        isAvailable,
        email,
        password: "",
      });
      
      // Update Redux store with new user data
      dispatch(updateReduxProfile({
        name,
        bio,
        isAvailable,
        email
      }));
      
      alert("Profile Updated!");
      setTimeout(() => navigate("/skillswap"), 1500);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
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

  // Show loading only if user is not logged in or currentUser is null
  if (!isLoggedIn || !currentUser) {
    return <p>Loading Profile...</p>;
  }

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

      {currentUser.userSkills?.length > 0 ? (
        <div>
          <h3>Skills</h3>
          <ul>
            {currentUser.userSkills.map((us: any) => (
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