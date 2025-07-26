import React from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";

const ThemeToggle: React.FC = () => {
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "20px",
        border: "none",
        background: mode === "dark" ? "#222" : "#eee",
        color: mode === "dark" ? "#fff" : "#222",
        cursor: "pointer",
        fontWeight: 600,
      }}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeToggle;
