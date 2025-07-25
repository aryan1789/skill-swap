import React,{useEffect,useState,useRef} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAppDispatch, useUserData } from "../store/hooks";
import { logout } from "../store/userSlice";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Redux state - this automatically updates when login/logout happens!
  const dispatch = useAppDispatch();
  const { isLoggedIn, currentUser } = useAuth();
  const { supabaseUid } = useUserData();
  
  console.log("Navbar - Auth state:", { isLoggedIn, currentUser, supabaseUid });

  const handleLogout = () => {
    // Dispatch Redux logout action (handles localStorage internally)
    dispatch(logout());
    
    setIsDropdownOpen(false);
    navigate("/login");
  };

  // No more useEffect needed! Redux automatically updates the component


  useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  return (
    <nav style={styles.navbar}>
      <div style={styles.title}>SkillSwap 🚀</div>
      <div style={styles.links}>
        {isLoggedIn ? (
          <>
        <NavLink to="/" current={location.pathname === "/"} label="Home" />
        <NavLink to="/skillswap" current={location.pathname === "/skillswap"} label="SkillSwap" />
        <NavLink to="/profile" current={location.pathname === "/profile"} label="Profile" />
        
  <div style={{ position: "relative" }} ref={dropdownRef}>
    <img
      src="Default_pfp.jpg"
      alt={currentUser?.name || "Profile"}
      style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    />
    {isDropdownOpen && (
      <div style={styles.dropdownMenu}>
        <Link to={`/viewprofile?id=${supabaseUid}`} style={styles.dropdownItem}>View Profile</Link>
        <div onClick={handleLogout} style={styles.dropdownItem}>Logout</div>
      </div>
    )}
  </div>
  </>
) : (
  <>
  <NavLink to="/login" current={location.pathname === "/login"} label="Login" />
  </>
)}
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, current }: { to: string; label: string; current: boolean }) => (
  <Link to={to} style={{ ...styles.link, ...(current ? styles.activeLink : {}) }}>
    {label}
  </Link>
);

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "#1e1e1e",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
    opacity: 0.7,
  },
  activeLink: {
    opacity: 1,
    borderBottom: "2px solid white",
    paddingBottom: "2px",
  },
  dropdownMenu: {
  position: "absolute",
  right: 0,
  top: "40px",
  backgroundColor: "#2e2e2e",
  border: "1px solid #444",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  zIndex: 1001,
  minWidth: "120px",
  overflow: "hidden",
},

dropdownItem: {
  padding: "10px 15px",
  color: "white",
  textDecoration: "none",
  display: "block",
  cursor: "pointer",
  fontSize: "0.9rem",
  borderBottom: "1px solid #3a3a3a",
},

};

export default Navbar;
