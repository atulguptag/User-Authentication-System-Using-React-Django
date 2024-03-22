import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Cookies from "js-cookie";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: "https://a.dj.api.easify.xyz/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize from localStorage or null
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [registrationToggle, setRegistrationToggle] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      // Update CSRF token from cookies on refresh
      const csrftoken = Cookies.get("csrftoken");
      if (csrftoken) {
        client.defaults.headers.common["X-CSRFToken"] = csrftoken;
      }
    }
    client
      .get("/api/user")
      .then(function (res) {
        setCurrentUser(true);
      })
      .catch(function (error) {
        // ...
      });
  }, []);

  function update_form_btn() {
    if (registrationToggle) {
      document.getElementById("form_btn").innerHTML = "Register";
      setRegistrationToggle(false);
    } else {
      document.getElementById("form_btn").innerHTML = "Log in";
      setRegistrationToggle(true);
    }
  }

  function submitRegistration(e) {
    e.preventDefault();
    client
      .post("/api/register", {
        email,
        username,
        password,
      })
      .catch(function (error) {
        // Handle error and display message
        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.error ||
            "Please Choose Another Email Address.";
          alert(errorMessage); // Display error message using alert
        } else {
          alert("An error occurred. Please try again later."); // Display generic error message
        }
      }).then(function (res) {
        client
          .post("/api/login", {
            email,
            password,
          })
          .then(function (res) {
            setCurrentUser(true);
            localStorage.setItem("user", JSON.stringify({ username })); // Store user data
          })
          .catch(function (error) {
            // Handle error and display message
            if (error.response && error.response.data) {
              const errorMessage =
                error.response.data.error ||
                "User Not Found";
              alert(errorMessage); // Display error message using alert
            } else {
              alert("An error occurred. Please try again later."); // Display generic error message
            }
          });
      });
  }

  function submitLogin(e) {
    e.preventDefault();
    client
      .post("/api/login", {
        email,
        password,
      })
      .then(function (res) {
        setCurrentUser(true);
        localStorage.setItem("user", JSON.stringify({ username })); // Store user data
      })
      .catch(function (error) {
        // Handle error and display message
        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.error ||
            "The email or password you entered did not match with our records. Please try again.";
          alert(errorMessage); // Display error message using alert
        } else {
          alert("An error occurred. Please try again later."); // Display generic error message
        }
      });
  }

  function submitLogout(e) {
    e.preventDefault();
    client.post("/api/logout", { withCredentials: true }).then(function (res) {
      setCurrentUser(false);
      localStorage.removeItem("user");
    });
  }

  if (currentUser) {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand>Authentication App</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <form onSubmit={(e) => submitLogout(e)}>
                  <Button type="submit" variant="light">
                    Log out
                  </Button>
                </form>
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div className="center">
          <h2>You're logged in!</h2>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Authentication App</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <Button id="form_btn" onClick={update_form_btn} variant="light">
                Register
              </Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {registrationToggle ? (
        <div className="center">
          <Form onSubmit={(e) => submitRegistration(e)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      ) : (
        <div className="center">
          <Form onSubmit={(e) => submitLogin(e)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
}

export default App;
