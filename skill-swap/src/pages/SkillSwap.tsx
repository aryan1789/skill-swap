import React, { useEffect, useState } from "react";
import { getUsers, getMatches } from "../api/userService";
import SearchBar from "../components/SearchBar";
import { getSSReqs } from "../api/skillSwapService"; // renamed helper
import { useAppSelector } from "../store/hooks";
import "./SkillSwap.css";

const SkillSwap: React.FC = () => {
  const userGuid = useAppSelector((state) => state.user.userGuid);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [bestMatches, setBestMatches] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  /* ------------------------------------------------------------------ */
  /*                             FETCH USERS                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    getUsers()
      .then((data) => {
        console.log("SkillSwap: Fetched users:", data);
        console.log("SkillSwap: Sample user structure:", data[0]);
        if (data[0]) {
          console.log("SkillSwap: Sample user supabaseUserId:", data[0].supabaseUserId);
        }
        // Filter out the current user from the users list
        const filteredData = data.filter((user: any) => 
          user.id.toString() !== userGuid && user.supabaseUserId !== userGuid
        );
        setUsers(filteredData);
        setFilteredUsers(filteredData);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
    if (userGuid) {
      getMatches(userGuid).then((matches) => {
        console.log("SkillSwap: Fetched matches:", matches);
        // Also filter out current user from best matches
        const filteredMatches = matches.filter((user: any) => 
          user.id.toString() !== userGuid && user.supabaseUserId !== userGuid
        );
        setBestMatches(filteredMatches);
      });
    }
  }, [userGuid]);

  /* ------------------------------------------------------------------ */
  /*                         SEARCH & SORT HELPERS                      */
  /* ------------------------------------------------------------------ */
  const handleSearch = (
    filterBy: "name" | "occupation",
    query: string
  ) => {
    const lower = query.toLowerCase();
    const result = users.filter((u) =>
      u[filterBy]?.toLowerCase().includes(lower)
    );
    setFilteredUsers(result);
  };

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
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "date-oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
    }
    setFilteredUsers(sorted);
  };

  /* ------------------------------------------------------------------ */
  /*                        SWAP REQUEST HANDLER                        */
  /* ------------------------------------------------------------------ */
  const handleSkillSwap = async (targetUser: any) => {
    if (!userGuid) {
      alert("You must be logged in to swap skills.");
      return;
    }

    console.log("Current userGuid:", userGuid);
    console.log("Available users:", users.map(u => ({ id: u.id, supabaseUserId: u.supabaseUserId })));

    // Get the logged‑in user object (either by internal id or Supabase userId)
    const requester =
      users.find((u) => u.id.toString() === userGuid) ||
      users.find((u) => u.supabaseUserId === userGuid);

    if (!requester) {
      console.error("Could not find user with userGuid:", userGuid);
      alert("Could not find your user profile. Please try logging in again.");
      return;
    }

    // Offered → first skill where skillType === 1 (Offering)
    const offeredSkill = requester.userSkills?.find((s: any) => s.skillType === 1);
    // Target   → first skill where skillType === 1 (Offering) from target user
    const requestedSkill = targetUser.userSkills?.find(
      (s: any) => s.skillType === 1
    );

    if (!offeredSkill) {
      alert("You must have at least one offered skill to swap. Add one to your profile first.");
      return;
    }
    if (!requestedSkill) {
      alert(`${targetUser.name} doesn't have any offered skills available to swap.`);
      return;
    }

    if (!offeredSkill.id || !requestedSkill.id) {
      alert("Invalid skill IDs detected – please refresh the page and try again.");
      return;
    }

    try {
      setIsSending(true);
      const res = await getSSReqs({
        requesterId: requester.id,
        targetUserId: targetUser.id,
        offeredSkillId: offeredSkill.id,
        targetSkillId: requestedSkill.id,
      });
      console.log("Skill swap request created:", res);
      alert("Skill swap request sent successfully!");
    } catch (error) {
      console.error("Error creating skill swap request:", error);
      alert("Failed to send skill swap request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*                               RENDER                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className="skillswap-page" style={styles.container}>
      <h2 className="page-title">SkillSwap</h2>
      <div style={styles.searchWrapper}>
        <SearchBar
          onSearch={handleSearch}
          onSort={handleSort}
          hasResults={filteredUsers.length > 0}
          totalItems={filteredUsers.length}
        />
      </div>
      <div style={styles.contentArea}>
        {/* Best Matches Section */}
        {bestMatches.length > 0 ? (
          <div style={{ marginBottom: "2rem" }}>
            <h3>Best Matches</h3>
            <div className="user-grid" style={styles.cardGrid}>
              {bestMatches.map((user) => (
                <div key={user.id} className="user-card" style={{ ...styles.card, border: "2px solid #3b82f6" }}>
                  <span style={{ background: "var(--primary)", color: "white", borderRadius: "8px", padding: "0.2rem 0.7rem", fontWeight: 700, fontSize: "0.85rem", position: "absolute", marginTop: "-1.2rem", marginLeft: "-1.2rem" }}>Good Match</span>
                  <img
                    src={user.profilePictureUrl || "Default_pfp.jpg"}
                    alt={`${user.name}'s profile`}
                    style={{ width: "100%", borderRadius: "12px" }}
                  />
                  <h3>{user.name}</h3>
                  <p><i>{user.occupation}</i></p>
                  <p>Member since {new Date(user.createdAt).toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <div style={styles.skillList}>
                    {user.skillsOffered?.map((skill: string, idx: number) => (
                      <span key={idx} style={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                  <div style={styles.buttonRow}>
                    {user.supabaseUserId && (
                        <button style={styles.button} onClick={() => (window.location.href = `/viewprofile?id=${user.supabaseUserId}`)}>View Profile</button>
                    )}
                    {!user.supabaseUserId && (
                        <button style={{ ...styles.button, opacity: 0.5, cursor: 'not-allowed' }} disabled>Profile Unavailable</button>
                    )}
                    <button style={styles.swapButton} onClick={() => handleSkillSwap(user)} disabled={isSending}>{isSending ? "Sending…" : "Swap Skills"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "2rem" }}>
            <h3>Best Matches</h3>
            <p>No matches found.</p>
          </div>
        )}
        {/* All Users Section (excluding best matches) */}
        <div className="user-grid" style={styles.cardGrid}>
          {filteredUsers.filter(u => !bestMatches.some(m => m.id === u.id)).map((user) => (
            <div key={user.id} className="user-card" style={styles.card}>
              <img
                src={user.profilePicture || "Default_pfp.jpg"}
                alt={`${user.name}'s profile`}
                style={{ width: "100%", borderRadius: "12px" }}
              />
              <h3>{user.name}</h3>
              <p><i>{user.occupation}</i></p>
              <p>Member since {new Date(user.createdAt).toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" })}</p>
              <div style={styles.skillList}>
                {user.userSkills?.map((us: any, index: number) => (
                  <span key={`${user.id}-${us.id}-${index}`} style={styles.skillBadge}>{us.skill.skillName}</span>
                ))}
              </div>
              <div style={styles.buttonRow}>
                {user.supabaseUserId && (
                    <button style={styles.button} onClick={() => (window.location.href = `/viewprofile?id=${user.supabaseUserId}`)}>View Profile</button>
                )}
                {!user.supabaseUserId && (
                    <button style={{ ...styles.button, opacity: 0.5, cursor: 'not-allowed' }} disabled>Profile Unavailable</button>
                )}
                <button style={styles.swapButton} onClick={() => handleSkillSwap(user)} disabled={isSending}>{isSending ? "Sending…" : "Swap Skills"}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------- */
/*                               STYLES                                */
/* -------------------------------------------------------------------- */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingTop: "80px",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingBottom: "2rem",
    margin: "0 auto",
    width: "100%",
  },
  searchWrapper: { marginBottom: "1.5rem" },
  contentArea: { minWidth: "60vw", minHeight: "100vh" },
  cardGrid: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
    minHeight: "300px",
  },
  card: {
    background: "var(--card-inverse)",
    color: "var(--card-inverse-text)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif",
    position: "relative",
  },
  skillList: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  skillBadge: {
    background: "var(--primary, #e0f2ff)",
    color: "var(--bg, #0077cc)",
    padding: "0.3rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  buttonRow: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  button: {
    flex: 1,
    backgroundColor: "var(--card)",
    color: "white",
    border: "none",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  swapButton: {
    flex: 1,
    backgroundColor: "var(--primary)",
    color: "white",
    border: "none",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
};

export default SkillSwap;
