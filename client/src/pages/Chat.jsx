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
      socket.current = io(process.env.REACT_APP_API_URL);
      socket.current.emit("add-user", currentUser._id);
      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
    
        const allUsersRoute = `${process.env.REACT_APP_API_URL}/api/auth/allusers/${currentUser._id}`;
        console.log("Fetching contacts from:", allUsersRoute); 
        if (currentUser.isAvatarImageSet) {
          try {
            console.log("Fetching contacts from:", allUsersRoute);
            const { data } = await axios.get(allUsersRoute);
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
  }, [currentUser, navigate]);

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
background-image: linear-gradient( 135deg, #F97794 10%, #623AA2 100%);`;

const InnerContainer = styled.div`
  height: 90vh;
  width: 80vw;
  background-color: #00000076;
  display: grid;
  grid-template-columns: 35% 65%;


  
`;
