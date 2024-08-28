import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const apiUrl = process.env.REACT_APP_API_URL;
  const allUsersRoute = `${apiUrl}/api/auth/allusers`;

  useEffect(() => {
    const getUser = async () => {
      const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(user));
      }
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(apiUrl);
      socket.current.emit("add-user", currentUser._id);

      // Cleanup function to disconnect socket on unmount
      return () => {
        socket.current.disconnect();
      };
    }
  }, [currentUser,apiUrl]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const { data } = await axios.get(
              `${allUsersRoute}/${currentUser._id}`
            );
            setContacts(data);
          } catch (error) {
            console.error("Error fetching contacts:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate,allUsersRoute]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <InnerContainer>
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </InnerContainer>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: black; 
`;

const InnerContainer = styled.div`
  height: 95vh;
  width: 95vw;
  background-color: #333333;
  display: grid;
  grid-template-columns: 35% 65%;


  
`;
