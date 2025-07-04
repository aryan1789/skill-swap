import axios from "axios";

const API = "http://localhost:5209/api/skills";

export const getSkills = async () => {
    const response = await axios.get(API);
    return response.data;
};

export const createSkill = async (skill: {name: string; description: string}) => {
    const response = await axios.post(API, skill);
    return response.data;
}