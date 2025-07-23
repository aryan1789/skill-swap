import React, { useEffect, useState } from "react";
import { getUsers } from "../api/userService";
import SearchBar from "../components/SearchBar";
import { getSSReqs } from "../api/skillSwapService"; // renamed helper

const SkillSwap: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  /* ------------------------------------------------------------------ */
  /*                             FETCH USERS                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    getUsers()
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

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
    const requesterId = localStorage.getItem("userGuid");
    if (!requesterId) {
      alert("You must be logged in to swap skills.");
      return;
    }

    // Get the logged‑in user object (either by internal id or Supabase userId)
    const requester =
      users.find((u) => u.id.toString() === requesterId) ||
      users.find((u) => u.supabaseUserId === requesterId);

    if (!requester) {
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
        targetSkillId: requestedSkill.id, // 🔑 the correct property name
      });

      console.log("Swap request sent:", res);
      alert(`Swap request sent to ${targetUser.name}!`);
    } catch (err) {
      console.error("Error sending swap request:", err);
      alert("Failed to send swap request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*                               RENDER                               */
  /* ------------------------------------------------------------------ */
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
              <p>
                <i>{user.occupation}</i>
              </p>
              <p>
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-NZ", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {/* Skill list */}
              <div style={styles.skillList}>
                {user.userSkills?.map((us: any, index: number) => (
                  <span
                    key={`${user.id}-${us.id}-${index}`}
                    style={styles.skillBadge}
                  >
                    {us.skill.skillName}
                  </span>
                ))}
              </div>
              {/* Buttons */}
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
                  disabled={isSending}
                >
                  {isSending ? "Sending…" : "Swap Skills"}
                </button>
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
    background: "#fff",
    color: "#111827",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif",
  },
  skillList: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
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
    backgroundColor: "#4a4949",
    color: "white",
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
