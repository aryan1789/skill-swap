import React, { useEffect, useState } from "react";
import { getUsers } from "../api/userService";
import SearchBar from "../components/SearchBar";

const SkillSwap: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers()
      .then((data) => {
        console.log("Fetched users:", data);
        setUsers(data);
        setFilteredUsers(data); // initialize with all
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, []);

  const handleSearch = (filterBy: "name" | "occupation", query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = users.filter((user) =>
      user[filterBy]?.toLowerCase().includes(lowerQuery)
    );
    setFilteredUsers(filtered);
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

  return (
    <div style={styles.container}>
      <h2>SkillSwap</h2>

      {/* Static SearchBar */}
      <div style={styles.searchWrapper}>
        <SearchBar
          onSearch={handleSearch}
          onSort={handleSort}
          hasResults={filteredUsers.length > 0}
          totalItems={filteredUsers.length}
        />
      </div>

      {/* Content stays fixed height so SearchBar doesn't move */}
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
                <div style={styles.skillList}>
                  {user.userSkills?.map((us: any) => (
                    <span key={us.skill.id} style={styles.skillBadge}>
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
                    onClick={() =>
                      alert(`Swap request sent to ${user.name}`)
                    }
                  >
                    Swap Skills
                  </button>
                </div>
              </div>
            ))
        }
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingTop: "80px",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingBottom: "2rem",
    margin: "0 auto",
    width: "100%",
  },
  searchWrapper: {
    marginBottom: "1.5rem",
  },
  contentArea: {
    minWidth: "60vw",
    minHeight: "100vh",
  },
  cardGrid: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
    minHeight: "300px",
  },
  card: {
    background: "#fff",
    color: "#111827", // <- ensures text is visible on white background
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif",
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
  noUsersMessage: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "2rem",
    fontSize: "1.2rem",
    color: "#6b7280",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default SkillSwap;
