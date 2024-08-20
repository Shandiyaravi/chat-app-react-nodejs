import React, { useState, useEffect } from "react";
import styled from "styled-components";
import logo from "../assets/logo.png"

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY
      );
      if (storedUser) {
        const data = JSON.parse(storedUser);
        if (data && data.username && data.avatarImage) {
          setCurrentUserName(data.username);
          setCurrentUserImage(data.avatarImage);
        }
      }
    };

    fetchUserData();
  }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <img src={logo} alt="logo_image" />
           
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => (
              <div
                key={contact._id}
                className={`contact ${
                  index === currentSelected ? "selected" : ""
                }`}
                onClick={() => changeCurrentChat(index, contact)}
              >
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                    alt="Avatar"
                  />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="User Avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 15% 70% 15%;
  height: 100%;
  overflow: hidden;
   background-color: #1c1c1c;

  .brand {
    display:flex;
    align-items:center;
    justify-content:center;
    background-color: #333333;

    img {
      height: 2.2rem;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem;
    gap: 0.8rem;

    &::-webkit-scrollbar {
      width: 0.2rem;

      &-thumb {
        background-color: #ffffff39;
        border-radius: 1rem;
      }
    }

    .contact {
      background-color: #333333;
      min-height: 5rem;
      cursor: pointer;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      gap: 1rem;
      transition: background-color 0.3s ease;
      text-transform:uppercase;

      .avatar {
        img {
          height: 3rem;
          width: 3rem;
          border-radius: 50%; 
        }
      }

      .username {
        h3 {
          font-size: 1rem;
          color: white;
        }
      }
    }

    .selected {
      background-color: #ff66b2;
    }
  }

  .current-user {
    background-color: #333333;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;

    .avatar {
      img {
        width: 35px;
        height: 35px;
        border-radius: 50%; /* Make current user image circular */
      }
    }

    .username {
      h2 {
        font-size:1rem;
        color: white;
        text-transform: uppercase;
      }
    }
  }

  @media screen and (max-width: 720px) {
    .contacts {
      padding: 0.5rem;

      .contact {
        flex-direction: column;
        gap: 0.2rem;

        .username {
          h3 {
            font-size: 1rem;
          }
        }

        .avatar {
          img {
            width: 30px;
            height: 30px;
          }
        }
      }
    }

    .current-user {
      gap: 0.5rem;

      .avatar {
        img {
          width: 40px;
          height: 40px;
        }
      }

      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }

  @media screen and (max-width: 495px) {

    
    .contacts {
      .contact {
        .username {
          h3 {
            font-size: 0.9rem;
          }
        }
      }
    }

    .current-user {
      flex-direction: column;
      gap: 0.3rem;

      .avatar {
        img {
          width: 30px;
          height: 30px;
        }
      }

      .username {
        h2 {
          font-size: 0.7rem;
        }
      }
    }

    
 @media screen and (max-width: 465px) {
 .brand {
      img{
     
      height:1.5rem;}
    }
    .contacts {
      .contact {
        margin: 0 0.6rem;
      }
    }
  }
`;
