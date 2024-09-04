import React, { useState, useEffect } from "react";
import styled from "styled-components";
import logo from "../assets/logo.png";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
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

  // Filter contacts based on the search query
  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <img src={logo} alt="logo_image" />
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="contacts">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact._id}
                className={`contact ${index === currentSelected ? "selected" : ""}`}
                onClick={() => changeCurrentChat(index, contact)}
              >
                <div className="avatar">
                  <img src={`data:image/svg+xml;base64,${contact.avatarImage}`} alt="Avatar" />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img src={`data:image/svg+xml;base64,${currentUserImage}`} alt="User Avatar" />
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
  grid-template-rows: 15% 10% 65% 10%;
  height: 100%;
  overflow: hidden;
  background-color: #1c1c1c;

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color:black;

    img {
      height: 2.2rem;
    }
  }

  .search {
    display: flex;
    justify-content: center;
    background-color: black;
    padding: 0.5rem;

    input {
      width: 80%;
      padding: 0.5rem;
      border: none;
      border-radius: 0.5rem;
      outline: none;
      background-color: #444444;
      color: white;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem;
    gap: 0.8rem;
    background-color:black;

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
      justify-content:center;
      padding: 0.5rem 1rem;
      gap: 1rem;
      transition: background-color 0.3s ease;
      text-transform: uppercase;

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
background-image: radial-gradient( circle farthest-corner at 13.8% 22.8%,  rgba(237,141,116,1) 0%, rgba(241,144,208,1) 90% );    }
  }

  .current-user {
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;

    .avatar {
      img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
      }
    }

    .username {
      h2 {
        font-size: 1rem;
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
            font-size: 0.6rem;
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
  }

  @media screen and (max-width: 465px) {
    .brand {
      img {
        height: 1.5rem;
      }
    }

    .contacts {
      .contact {
        margin: 0 0.6rem;
      }
    }
  }
`;
