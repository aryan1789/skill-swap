import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaFilter, FaSortUp, FaSortDown } from "react-icons/fa";
import "../SearchBar.css";

interface Props {
  onSearch: (filterBy: "name" | "occupation", query: string) => void;
  onSort: (sortBy: string) => void;
  hasResults: boolean;
  totalItems: number;
}

const SearchBar: React.FC<Props> = ({ onSearch, onSort, hasResults, totalItems }) => {
  const [filterBy, setFilterBy] = useState<"name" | "occupation">("name");
  const [query, setQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (value: "name" | "occupation") => {
    setFilterBy(value);
    setShowFilterDropdown(false);
    onSearch(value, query);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(filterBy, value);
  };

  const handleSortClick = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onSort(`${filterBy}-${newOrder}`);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch(filterBy, "");
  };

  return (
    <>
      <div className="search-bar">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search by ${filterBy}...`}
            value={query}
            onChange={handleSearchChange}
            className="search-input"
          />
          {query && (
            <button onClick={clearSearch} className="clear-btn">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filter-container" ref={filterRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="filter-btn"
          >
            <FaFilter />
          </button>
          {showFilterDropdown && (
            <div className="filter-dropdown">
              <div
                className={`filter-option ${filterBy === "name" ? "active" : ""}`}
                onClick={() => handleFilterChange("name")}
              >
                Name
              </div>
              <div
                className={`filter-option ${filterBy === "occupation" ? "active" : ""}`}
                onClick={() => handleFilterChange("occupation")}
              >
                Occupation
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSortClick} className="sort-btn">
          {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
        </button>
      </div>

      {query && !hasResults && (
        <div className="no-results-message">
          <p>
            No results found for <strong>"{query}"</strong> in {filterBy}
          </p>
          <button onClick={clearSearch} className="clear-search-link">
            Clear search
          </button>
        </div>
      )}

      {query && hasResults && (
        <div className="results-count">
          Found {totalItems} result{totalItems !== 1 ? "s" : ""} for "{query}"
        </div>
      )}
    </>
  );
};

export default SearchBar;
