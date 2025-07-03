import axios from "axios";

const API = "http://localhost:5209/api/user";

export const getUsers = async () => {
    const response = await axios.get(API);
    return response.data;
}