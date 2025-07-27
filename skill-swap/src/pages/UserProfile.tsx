import React from "react";
import { useEffect, useState } from "react";
import { updateUserProfile } from "../api/userService";
import { getSkills } from "../api/skillService";
import { updateUserSkillsByType } from "../api/userSkillService";
import "../UserProfile.css"; 
import { useNavigate } from "react-router-dom";
import { useAuth, useAppDispatch } from "../store/hooks";
import { updateUserProfile as updateReduxProfile } from "../store/userSlice";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Skills management
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [selectedOfferingSkills, setSelectedOfferingSkills] = useState<number[]>([]);
  const [selectedSeekingSkills, setSelectedSeekingSkills] = useState<number[]>([]);
  
  console.log("UserProfile - Redux user:", currentUser);
  
  // Handle skill selection/deselection for offering skills
  const handleOfferingSkillToggle = (skillId: number) => {
    const isSelected = selectedOfferingSkills.includes(skillId);
    
    if (isSelected) {
      // Remove skill
      setSelectedOfferingSkills(selectedOfferingSkills.filter((id: number) => id !== skillId));
    } else {
      // Add skill
      setSelectedOfferingSkills([...selectedOfferingSkills, skillId]);
    }
  };

  // Handle skill selection/deselection for seeking skills
  const handleSeekingSkillToggle = (skillId: number) => {
    const isSelected = selectedSeekingSkills.includes(skillId);
    
    if (isSelected) {
      // Remove skill
      setSelectedSeekingSkills(selectedSeekingSkills.filter((id: number) => id !== skillId));
    } else {
      // Add skill
      setSelectedSeekingSkills([...selectedSeekingSkills, skillId]);
    }
  };
  
  // Initialize form with Redux user data (instant loading!)
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setBio(currentUser.bio || "");
      setEmail(currentUser.email || "");
      // Initialize selected skills by type
      if (currentUser.userSkills) {
        const offeringSkills = currentUser.userSkills
          .filter((us: any) => us.skillType === 1)
          .map((us: any) => us.skill.id);
        const seekingSkills = currentUser.userSkills
          .filter((us: any) => us.skillType === 2)
          .map((us: any) => us.skill.id);
        
        setSelectedOfferingSkills(offeringSkills);
        setSelectedSeekingSkills(seekingSkills);
      }
    }
  }, [currentUser]);

  // Load available skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await getSkills();
        setAvailableSkills(skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      }
    };
    loadSkills();
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!currentUser?.id) {
      setError("User ID not found");
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log("Updating user profile with:", {
        name,
        bio,
        email,
        password: password ? "***" : "",
        skills: selectedOfferingSkills.concat(selectedSeekingSkills)
      });

      // Update user profile in database
      const updateData = {
        name,
        bio,
        isAvailable: currentUser.isAvailable ?? true, // Keep existing availability
        email,
        password: password || "", // Backend should ignore empty password
      };

      await updateUserProfile(currentUser.id, updateData);
      
      // Update skills in backend
      try {
        const updatedUserSkills = await updateUserSkillsByType(currentUser.id, selectedOfferingSkills, selectedSeekingSkills);
        
        // Update Redux store with new user data including skills
        dispatch(updateReduxProfile({
          name,
          bio,
          email,
          userSkills: updatedUserSkills
        }));
        
        // Also update localStorage for persistence
        const updatedUser = { 
          ...currentUser, 
          name,
          bio,
          email,
          userSkills: updatedUserSkills 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        console.log("Profile and skills updated successfully:", updatedUserSkills);
      } catch (skillError) {
        console.error("Failed to update skills:", skillError);
        // Still update the basic profile info even if skills fail
        dispatch(updateReduxProfile({
          name,
          bio,
          email
        }));
      }
      
      setMessage("Profile updated successfully!");
      setPassword(""); // Clear password fields after successful update
      setConfirmPassword("");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
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
    return (
      <div className="user-profile-container">
        <div className="profile-card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: "24px", height: "24px" }}></div>
            <p>Loading Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="login-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1>My Profile</h1>
          <p>Manage your account settings and skills</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#FEF2F2" />
                <path d="M8 4V8M8 12H8.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {message && (
            <div className="success-message" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#BBF7D0" />
                <path d="M5 8L7 10L11 6" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
              <FaUser className="input-icon" size={16} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                required
              />
              <FaEnvelope className="input-icon" size={16} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              className="form-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself and what you're passionate about..."
              style={{ minHeight: "80px", resize: "vertical" }}
            />
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "right", marginTop: "4px" }}>
              {bio.length}/500 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Change Password (optional)</label>
            <div className="input-wrapper">
              <input
                id="password"
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
              <FaLock className="input-icon" size={16} />
            </div>
          </div>

          {password && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
                <FaLock className="input-icon" size={16} />
              </div>
            </div>
          )}

          {/* Skills Section */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            {/* Offering Skills */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text)" }}>Skills I'm Offering</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
                  Select the skills you want to teach or help others with
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {availableSkills.map((skill) => {
                  const isSelected = selectedOfferingSkills.includes(skill.id);
                  return (
                    <button
                      key={`offering-${skill.id}`}
                      type="button"
                      onClick={() => handleOfferingSkillToggle(skill.id)}
                      disabled={loading}
                      style={{
                        background: isSelected ? "var(--primary)" : "var(--card-hover)",
                        color: isSelected ? "white" : "var(--text)",
                        border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border)",
                        padding: "0.5rem 1rem",
                        borderRadius: "25px",
                        fontSize: "0.875rem",
                        fontWeight: isSelected ? 600 : 500,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        opacity: loading ? 0.7 : 1,
                        outline: "none",
                        boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = isSelected 
                            ? "0 4px 12px rgba(59, 130, 246, 0.4)" 
                            : "0 2px 8px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = isSelected 
                            ? "0 2px 8px rgba(59, 130, 246, 0.3)" 
                            : "none";
                        }
                      }}
                    >
                      {skill.skillName}
                    </button>
                  );
                })}
              </div>

              {selectedOfferingSkills.length === 0 && (
                <p style={{ 
                  color: "var(--text-secondary)", 
                  fontStyle: "italic", 
                  marginTop: "1rem",
                  fontSize: "0.875rem"
                }}>
                  No offering skills selected yet.
                </p>
              )}
            </div>

            {/* Seeking Skills */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text)" }}>Skills I'm Seeking</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
                  Select the skills you want to learn from others
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {availableSkills.map((skill) => {
                  const isSelected = selectedSeekingSkills.includes(skill.id);
                  return (
                    <button
                      key={`seeking-${skill.id}`}
                      type="button"
                      onClick={() => handleSeekingSkillToggle(skill.id)}
                      disabled={loading}
                      style={{
                        background: isSelected ? "var(--primary)" : "var(--card-hover)",
                        color: isSelected ? "white" : "var(--text)",
                        border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border)",
                        padding: "0.5rem 1rem",
                        borderRadius: "25px",
                        fontSize: "0.875rem",
                        fontWeight: isSelected ? 600 : 500,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        opacity: loading ? 0.7 : 1,
                        outline: "none",
                        boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = isSelected 
                            ? "0 4px 12px rgba(59, 130, 246, 0.4)" 
                            : "0 2px 8px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = isSelected 
                            ? "0 2px 8px rgba(59, 130, 246, 0.3)" 
                            : "none";
                        }
                      }}
                    >
                      {skill.skillName}
                    </button>
                  );
                })}
              </div>

              {selectedSeekingSkills.length === 0 && (
                <p style={{ 
                  color: "var(--text-secondary)", 
                  fontStyle: "italic", 
                  marginTop: "1rem",
                  fontSize: "0.875rem"
                }}>
                  No seeking skills selected yet.
                </p>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: "2rem" }}>
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;