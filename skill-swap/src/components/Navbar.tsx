import React,{useEffect,useState,useRef} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useAppDispatch, useUserData, useAppSelector } from "../store/hooks";
import { logout } from "../store/userSlice";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useAppDispatch();
  const { isLoggedIn, currentUser } = useAuth();
  const { supabaseUid } = useUserData();
  const hasUnreadMessages = useAppSelector((state) => state.user.hasUnreadMessages);
  const mode = useAppSelector((state) => state.theme.mode);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
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
    <nav className="navbar-container" style={{
      ...styles.navbar,
      backgroundColor: mode === "dark" ? "#18181b" : "#f9fafb",
      color: mode === "dark" ? "#f3f4f6" : "#111827"
    }}>
      <div className="navbar-title" style={styles.title}>SkillSwap</div>
      
      {/* Desktop Navigation */}
      <div className={`navbar-links desktop-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={styles.links}>
        {isLoggedIn ? (
          <>
            <NavLink to="/" current={location.pathname === "/"} label="Home" onMobileClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to="/skillswap" current={location.pathname === "/skillswap"} label="SkillSwap" onMobileClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to="/swap-requests" current={location.pathname === "/swap-requests"} label="Requests" onMobileClick={() => setIsMobileMenuOpen(false)} />
            <ChatNavLink to="/chat" current={location.pathname === "/chat"} label="Chat" hasNotification={hasUnreadMessages} onMobileClick={() => setIsMobileMenuOpen(false)} />
            <NavLink to="/profile" current={location.pathname === "/profile"} label="Profile" onMobileClick={() => setIsMobileMenuOpen(false)} />
            
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <img
                src="Default_pfp.jpg"
                alt={currentUser?.name || "Profile"}
                className="profile-avatar"
                style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="dropdown-menu" style={styles.dropdownMenu}>
                  <Link to={`/viewprofile?id=${supabaseUid}`} style={styles.dropdownItem} onClick={() => {setIsDropdownOpen(false); setIsMobileMenuOpen(false);}}>View Profile</Link>
                  <div onClick={handleLogout} style={styles.dropdownItem}>Logout</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" current={location.pathname === "/login"} label="Login" onMobileClick={() => setIsMobileMenuOpen(false)} />
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={styles.mobileMenuToggle}
        aria-label="Toggle mobile menu"
      >
        <span className="hamburger-line" style={styles.hamburgerLine}></span>
        <span className="hamburger-line" style={styles.hamburgerLine}></span>
        <span className="hamburger-line" style={styles.hamburgerLine}></span>
      </button>

      {/* Theme Toggle */}
      <div className="theme-toggle" style={{ marginLeft: "auto", marginRight: "1rem" }}>
        <ThemeToggle />
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, current, onMobileClick }: { to: string; label: string; current: boolean; onMobileClick?: () => void }) => (
  <Link to={to} className="navbar-link" style={{ ...styles.link, ...(current ? styles.activeLink : {}) }} onClick={onMobileClick}>
    {label}
  </Link>
);

const ChatNavLink = ({ to, label, current, hasNotification, onMobileClick }: { 
  to: string; 
  label: string; 
  current: boolean; 
  hasNotification: boolean;
  onMobileClick?: () => void;
}) => (
  <Link to={to} className="navbar-link" style={{ ...styles.link, ...(current ? styles.activeLink : {}), position: "relative" }} onClick={onMobileClick}>
    {label}
    {hasNotification && (
      <div style={styles.notificationBubble}></div>
    )}
  </Link>
);

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
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
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 500,
    opacity: 0.7,
    transition: "color 0.2s, opacity 0.2s",
  },
  activeLink: {
    opacity: 1,
    borderBottom: "2px solid var(--primary)",
    paddingBottom: "2px",
    color: "var(--primary)",
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

notificationBubble: {
  position: "absolute",
  top: "-2px",
  right: "-6px",
  width: "8px",
  height: "8px",
  backgroundColor: "#ff4757",
  borderRadius: "50%",
  border: "1px solid white",
},

mobileMenuToggle: {
  display: "none",
  flexDirection: "column" as const,
  justifyContent: "space-around",
  width: "30px",
  height: "30px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
},

hamburgerLine: {
  width: "25px",
  height: "3px",
  backgroundColor: "var(--text)",
  borderRadius: "10px",
  transition: "all 0.3s linear",
  transformOrigin: "1px",
},

};

export default Navbar;
