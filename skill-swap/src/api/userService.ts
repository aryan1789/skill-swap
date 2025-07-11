import axios from "axios";

const API = "http://localhost:5209/api/users";

export const getUsers = async () => {
    const response = await axios.get(API);
    return response.data;
}

export const getUserById = async (id:string) => {
    const response = await axios.get(`${API}/${id}`);
    return response.data;
}

export const createUser = async (user: {name: string, email: string }) => {
    const response = await axios.post(API,user);
    return response.data;
};

export const updateUserProfile = async (
    id: string,
    updatedUser: {name: string; bio: string; isAvailable: boolean;email:string;password:string;/*profilePicUrl?: string*/}
) => {
    const response = await axios.put(`${API}/${id}`,updatedUser);
    return response.data;
};