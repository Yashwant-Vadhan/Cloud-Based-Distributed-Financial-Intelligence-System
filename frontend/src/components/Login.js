import { useState } from "react";

function Login({ setIsLoggedIn }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const AUTH_URL = process.env.REACT_APP_AUTH_URL;

  const handleSubmit = async () => {
    if (email === "" || password === "" || (isSignup && username === "")) {
      alert("Fill all fields");
      return;
    }

    try {
      if (isSignup) {
        const response = await fetch(`${AUTH_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        
        if (response.ok) {
          alert("Signup successful! Please login.");
          setIsSignup(false);
        } else {
          alert(data.msg || "Signup failed");
        }
      } else {
        const response = await fetch(`${AUTH_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userProfile", JSON.stringify(data.user));
          localStorage.setItem("isLoggedIn", "true");
          setIsLoggedIn(true);
        } else {
          alert(data.msg || "Invalid credentials");
        }
      }
    } catch (err) {
      alert("Error connecting to Auth service");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-bold transition-colors"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p
          onClick={() => setIsSignup(!isSignup)}
          className="text-blue-500 text-center mt-4 cursor-pointer hover:underline"
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Create one"}
        </p>
      </div>
    </div>
  );
}

export default Login;