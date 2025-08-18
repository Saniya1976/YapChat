import axios from "axios";
import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response=await axiosInstance.get("/users/friend-requests");
  return response.data;
}
export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}
// export const getStreamToken = async () => {
//   const response = await fetch("/api/get-stream-token", {
//     credentials: "include", // Send cookies
//   });
//   if (!response.ok) throw new Error("Failed to fetch token");
//   return response.json();
// };

export const getStreamToken = async () => {
  console.log('🔑 Requesting token from /api/get-stream-token');
  
  try {
    const response = await fetch("/api/get-stream-token", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('🔑 Response status:', response.status);
    console.log('🔑 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔑 Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🔑 Token data received:', data);
    
    // Validate response structure
    if (!data.token) {
      throw new Error('Invalid response: missing token field');
    }
    
    return data;
  } catch (error) {
    console.error('🔑 Token fetch error:', error);
    throw error;
  }
};