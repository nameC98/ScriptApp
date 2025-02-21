const API_URL = "http://localhost:5000/api/auth";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // Save both token and userId in localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.userId);

  return data;
};

export const forgotPassword = async ({ email }) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  return response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
};
