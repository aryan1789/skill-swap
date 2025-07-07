import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav style={styles.navbar}>
      <div style={styles.title}>SkillSwap 🚀</div>
      <div style={styles.links}>
        <NavLink to="/" current={location.pathname === "/"} label="Home" />
        <NavLink to="/skillswap" current={location.pathname === "/skillswap"} label="SkillSwap" />
        <NavLink to="/profile" current={location.pathname === "/profile"} label="Profile" />
        <NavLink to="/login" current={location.pathname === "/login"} label="Login" />
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
};

export default Navbar;
