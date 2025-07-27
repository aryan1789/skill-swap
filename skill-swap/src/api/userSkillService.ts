import axios from "axios";

axios.defaults.baseURL = "http://localhost:5209/api";
axios.defaults.headers.common["Authorization"] = localStorage.getItem("token") || "";

const BASE_URL = "http://localhost:5209/api/UserSkills";

// Update all user skills at once
export const updateUserSkills = async (userId: string, skillIds: number[]) => {
  const token = localStorage.getItem("token") ?? "";
  
  const response = await axios.put(`${BASE_URL}/${userId}`, skillIds, {
    headers: { Authorization: token, 'Content-Type': 'application/json' }
  });
  
  return response.data;
};

// Update user skills by type (offering and seeking)
export const updateUserSkillsByType = async (userId: string, offeringSkills: number[], seekingSkills: number[]) => {
  const token = localStorage.getItem("token") ?? "";
  
  const skillsData = {
    offeringSkills,
    seekingSkills
  };
  
  const response = await axios.put(`${BASE_URL}/${userId}/by-type`, skillsData, {
    headers: { Authorization: token, 'Content-Type': 'application/json' }
  });
  
  return response.data;
};

// Get user skills
export const getUserSkills = async (userId: string) => {
  const token = localStorage.getItem("token") ?? "";
  const response = await axios.get(`${BASE_URL}/${userId}`, {
    headers: { Authorization: token }
  });
  return response.data;
};

// Add a single user skill
export const addUserSkill = async (userId: string, skillId: number, skillType: number = 1, proficiencyLevel: number = 3) => {
  const token = localStorage.getItem("token") ?? "";
  const userSkill = {
    skillId,
    skillType,
    proficiencyLevel,
    notes: ""
  };
  
  const response = await axios.post(`${BASE_URL}/${userId}`, userSkill, {
    headers: { Authorization: token, 'Content-Type': 'application/json' }
  });
  return response.data;
};

// Remove a user skill
export const removeUserSkill = async (userId: string, skillId: number) => {
  const token = localStorage.getItem("token") ?? "";
  const response = await axios.delete(`${BASE_URL}/${userId}/${skillId}`, {
    headers: { Authorization: token }
  });
  return response.data;
};
