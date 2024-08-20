import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import Logout from "./Logout";

export default function Welcome() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.username) {
          setUserName(parsedUser.username);
        }
      }
    };

    fetchUserName();
  }, []);

  return (
    <Container>
      <LogoutWrapper>
        <Logout />
      </LogoutWrapper>
      <Content>
        <img src={Robot} alt="Welcome Robot" />
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to start messaging.</h3>
      </Content>
    </Container>
  );
}

const Container = styled.div`
position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;

const LogoutWrapper = styled.div`
  position: absolute;
  top: 1rem; /* Space from the top */
  right: 1rem; /* Space from the right */
`;

const Content = styled.div`
  text-align: center; /* Center-align text */
  img {
    height: 20rem; /* Adjust as needed */
    margin-bottom: 1rem; /* Space between image and text */
  }
  span {
    color: #ff66b2;
    font-weight: bold;
  }
  h3 {
    margin-top: 0.5rem;
    font-weight: normal;
  }
  @media screen and (max-width: 500px) {
    h1{
    font-size:1.5rem;}
    span {
      
      font-size: 1.5rem;
    }
    h3 {
      font-size: 0.7rem;
    }
  }
`;