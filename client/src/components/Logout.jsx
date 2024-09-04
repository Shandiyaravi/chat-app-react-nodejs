import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import axios from "axios";


export default function Logout() {
  const navigate = useNavigate();
  
  

  const handleClick = async () => {
    try {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (!user || !user._id) {
        console.log("No user found in localStorage");
        throw new Error("User not found.");
      }
      const logoutRoute = `${process.env.REACT_APP_API_URL}/api/auth/logout/${user._id}`;
      const response = await axios.get(logoutRoute);
      console.log("Logout response:", response);
      
      if (response.status === 200) {
        // Clear localStorage and redirect
        localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
        navigate("/login");
      } else {
        console.error("Logout failed: ", response.data);
      }
    } catch (error) {
      console.error("Error during logout: ", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 1rem;
  background-color: #ff66b2;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1rem;
    color: #ebe7ff;
  }
`;
