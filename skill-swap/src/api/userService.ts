import axios from "axios";

axios.defaults.baseURL = "http://localhost:5209/api";
axios.defaults.headers.common["Authorization"] = localStorage.getItem("token") || "";
const BASE_URL = "http://localhost:5209/api/users";

// GET all users
export const getUsers = async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
};

// GET user by Supabase ID
export const getUserBySupabaseId = async (supabaseUserId: string) => {
    const token = localStorage.getItem("token") ?? "";
    const response = await axios.get(`${BASE_URL}/bysupabaseid/${supabaseUserId}`,
        {headers: { Authorization: token } }
    );
    return response.data;
};

// PUT update user by user ID (your DB GUID)
export const updateUserProfile = async (
    id: string,
    updatedUser: {
        name: string;
        bio: string;
        isAvailable: boolean;
        email: string;
        password: string;
        // profilePicUrl?: string;
    }
) => {
    const response = await axios.put(`${BASE_URL}/${id}`, updatedUser);
    return response.data;
};

// POST create user (used if needed separately from Supabase)
export const createUser = async (user: { name: string; email: string }) => {
    const response = await axios.post(BASE_URL, user);
    return response.data;
};

// add right below getUserBySupabaseId
export const getUserById = async (id: string) => {
  const token = localStorage.getItem("token") ?? "";
  const { data } = await axios.get(`${BASE_URL}/${id}`, {
    headers: { Authorization: token },
  });
  return data;
};

export const getMatches = async (userId: string) => {
  const { data } = await axios.get(`/users/matchmaking/${userId}`);
  return data;
};
