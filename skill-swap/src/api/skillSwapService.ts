import axios from "axios";

const BASE_URL = "http://localhost:5209/api/SkillSwaps";

// Create a new skill swap request
export const getSSReqs = async (payload: {
    requesterId: string;
    targetUserId: string;
    offeredSkillId: string;
    requestedSkillId: string;
}) => {
    const response = await axios.post(BASE_URL, payload);
    return response.data;
};

// Get all skill swaps for a user
export const getSkillSwapsForUser = async (userId: string) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    return response.data;
};

// Accept or reject a request
export const updateSwapStatus = async (id: string, status: string) => {
    const response = await axios.put(`${BASE_URL}/${id}/status`, {
        headers: { 'Content-Type': 'application/json' },
        data: status
    });
    return response.data;
};
