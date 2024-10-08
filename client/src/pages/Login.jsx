import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const loginRoute = `${process.env.REACT_APP_API_URL}/api/auth/login`;

  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleValidation = useCallback(() => {
    const { username, password } = values;
    if (username === "" || password === "") {
      toast.error("Username and Password are required.");
      return false;
    }
    return true;
  }, [values]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { username, password } = values;
      const toastOptions = {
        position: "bottom-right",
        autoClose: 8000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      };
      try {
        console.log('Login URL:', loginRoute); // Debug log
        const response = await axios.post(loginRoute, {
          username,
          password,
        }, {
          withCredentials: true 
        });

        const { data } = response;

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        } else if (data.status === true) {
          localStorage.setItem(
            process.env.REACT_APP_LOCALHOST_KEY,
            JSON.stringify(data.user)
          );
          navigate("/");
        }
      } catch (error) {
        toast.error("An error occurred during login. Please try again later.", toastOptions);
        console.error("Login error:", error);
      }
    }
  }, [values, navigate, handleValidation, loginRoute]);

  return (
    <>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <div className="brand">
             <img src={logo} alt="logo" />  
            
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={values.username}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={values.password}
            onChange={handleChange}
          />
          <button type="submit">Login</button>
          <span>
            Don't have an account? <Link to="/register">Register</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #4B0082;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    
    img{
    width:6rem;
    height:3rem;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 2rem 5rem;
    input {
      background: transparent;
      border: 0.1rem solid #623AA2;
      padding: 1rem;
      border-radius: 0.4rem;
      color: white;
      width: 100%;
      font-size: 1rem;
      &:focus {
        border: 0.1rem solid #F97794;
        outline: none;
      }
    }
    button {
          background-image: linear-gradient( 135deg, #F97794 10%, #623AA2 100%);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 0.4rem;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.5s ease-in-out;
    }
    span {
      color: white;
      a {
        color:#FF66B2 ;
        text-decoration: none;
      }
    }
  }
`;
