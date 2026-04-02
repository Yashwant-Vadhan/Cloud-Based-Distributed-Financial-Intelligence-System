import { useState } from "react";

function Login({ setIsLoggedIn }) {

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {

    if (email === "" || password === "") {
      alert("Fill all fields");
      return;
    }

    if (isSignup) {
      const userAccount = { email, password };
      localStorage.setItem("userAccount", JSON.stringify(userAccount));
      alert("Signup successful! Please login.");
      setIsSignup(false);
    } else {
      const saved = JSON.parse(localStorage.getItem("userAccount"));

      if (!saved) {
        alert("No account found. Please sign up.");
        return;
      }

      if (saved.email === email && saved.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      } else {
        alert("Invalid email or password ❌");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">

        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4 rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-2 rounded-lg"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p
          onClick={() => setIsSignup(!isSignup)}
          className="text-blue-500 text-center mt-4 cursor-pointer"
        >
          {isSignup ? "Login instead" : "Create new account"}
        </p>

      </div>

    </div>
  );
}

export default Login;