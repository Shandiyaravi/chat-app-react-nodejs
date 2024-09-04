import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Modal from "./Modal";
import Logout from "./Logout"; // Import your Logout component

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false); 

  const sendMessageRoute = `${process.env.REACT_APP_API_URL}/api/messages/addmsg`;
  const receiveMessageRoute = `${process.env.REACT_APP_API_URL}/api/messages/getmsg`;
  const checkBlockStatusRoute = `${process.env.REACT_APP_API_URL}/api/auth/check-block-status`;
  const block = `${process.env.REACT_APP_API_URL}/api/auth/blockUser`;
  const unblock = `${process.env.REACT_APP_API_URL}/api/auth/unblockUser`;

  // Fetch messages when the currentChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (user && currentChat) {
        const response = await axios.post(receiveMessageRoute, {
          from: user._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };
    fetchMessages();
  }, [currentChat, receiveMessageRoute]);

  // Set up socket listeners
  useEffect(() => {
    const currentSocket = socket.current;

    if (currentSocket) {
      currentSocket.on("msg-recieve", (msg) => {
        console.log("Message received:", msg); 
        if (!isBlocked) {
          setArrivalMessage({ fromSelf: false, message: msg });
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("msg-recieve");
      }
    };
  }, [isBlocked, socket]);

  // Update messages with the arrivalMessage
  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  // Scroll to the bottom of the messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if the user is blocked or blocked by the current chat
  useEffect(() => {
    const checkIfBlocked = async () => {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (user && currentChat) {
        const response = await axios.post(checkBlockStatusRoute, {
          blockerId: user._id,
          blockedId: currentChat._id,
        });
        setIsBlocked(response.data.isBlocked);
      }
    };
    checkIfBlocked();
  }, [currentChat, checkBlockStatusRoute]);

  // Handle sending messages
  const handleSendMsg = async (msg) => {
    if (isBlocked) {
      setModalMessage("You cannot send messages to this user as they are blocked.");
      setModalVisible(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));

    if (user && currentChat) {
      try {
        // Check if the recipient has blocked you
        const checkResponse = await axios.post(checkBlockStatusRoute, {
          blockerId: currentChat._id,
          blockedId: user._id,
        });

        if (checkResponse.data.isBlocked) {
          setModalMessage("You cannot send messages to this user as they have blocked you.");
          setModalVisible(true);
          return;
        }

        // Emit the message via socket
        socket.current.emit("send-msg", {
          to: currentChat._id,
          from: user._id,
          msg,
        });

        // Save the message
        await axios.post(sendMessageRoute, {
          from: user._id,
          to: currentChat._id,
          message: msg,
        });

        setMessages([...messages, { fromSelf: true, message: msg }]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Toggle block status
  const toggleBlock = async () => {
    const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));

    try {
      const checkResponse = await axios.post(checkBlockStatusRoute, {
        blockerId: user._id,
        blockedId: currentChat._id,
      });

      if (checkResponse.data.isBlocked) {
        // Unblock
        const response = await axios.post(unblock, {
          blockerId: user._id,
          blockedId: currentChat._id,
        });
        if (response.data.status) {
          setIsBlocked(false);
        }
      } else {
        // Block
        const response = await axios.post(block, {
          blockerId: user._id,
          blockedId: currentChat._id,
        });
        if (response.data.status) {
          setIsBlocked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  // Handle dropdown menu visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt="avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            ⋮
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={toggleBlock}>
                {isBlocked ? "Unblock" : "Block"} 
              </button>
              <Logout /> 
            </div>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div
              className={`message ${
                message.fromSelf ? "sended" : "recieved"
              }`}
            >
              <div className="content">
                <p>{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
      {modalVisible && (
        <Modal
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 100%;
  display: grid;
  grid-template-rows: 15% 70% 15%;
  overflow-y: hidden;
  overflow-x: hidden;

  .chat-header {
    display: flex;
    background-color: #1c1c1c;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 1rem;

    .user-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .avatar {
        img {
          height: 2rem;
        }
      }

      .username {
        h3 {
          font-size: 1rem;
          color: white;
          text-transform: uppercase;
        }
      }
    }

    .dropdown {
      position: relative;

      .dropdown-toggle {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .dropdown-menu {
        position: absolute;
        right: 0;
        padding:0.5rem;
        top: 2rem;
        background-color: #444;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

        button {
        margin:1rem 0.5rem;
          display: block;
          max-width: 100%;
          padding: 0.5rem 0.5rem;
          background: none;
          border: 1px solid black;
          border-radius:10px;
          color: white;
          text-align: right;
          cursor: pointer;

          &:hover {
            background-color: #555;
          }
        }
      }
    }
  }

  .chat-messages {
    padding: 2rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      
      &-thumb {
        background-color: #ffffff39;
        width: 0.2rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 50%;
        overflow-wrap: break-word;
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 1rem;
        color: #333333;
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #F5F5DC;
      }
    }

    .recieved {
      justify-content: flex-start;

      .content {
        background-color: #F5F5DC;
      }
    }
  }

  @media screen and (max-width: 510px) {
    .username {
      h3 {
        font-size: 0.5rem;
      }
    }

    .message {
      .content {
        max-width: 45%;
        padding: 0.7rem;
        font-size: 0.8rem;
      }
    }
  }
`;
