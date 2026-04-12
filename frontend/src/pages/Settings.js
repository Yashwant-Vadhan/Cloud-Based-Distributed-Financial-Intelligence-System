import React, { useState, useEffect } from "react";

function Settings() {
  const [currency, setCurrency] = useState("INR");
  const [step, setStep] = useState("input"); // 'input' or 'otp'
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const AUTH_URL = process.env.REACT_APP_AUTH_URL;

  // Load the user's email from the profile stored in backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.email) {
          setUserEmail(data.email);
        }
      } catch (err) {
        console.error("Settings profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [AUTH_URL]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const saveCurrency = () => {
    alert(`Currency updated to ${currency}`);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (!userEmail) {
      alert("No registered email found in your profile. Please update your profile first.");
      return;
    }

    // 1. Generate a random 4-digit OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);

    // 2. Call your local Node.js server to send the real email
    try {
      const response = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          otp: newOtp
        }),
      });

      if (response.ok) {
        alert(`A real OTP has been sent to ${userEmail}`);
        setStep("otp");
      } else {
        alert("Server found, but failed to send email. Check your server console.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to server. Did you run 'node server.js'?");
    }
  };

  const handleVerifyAndSave = () => {
    if (otpInput === generatedOtp) {
      // 1. Get the current account data
      const savedAccount = JSON.parse(localStorage.getItem("userAccount"));
      
      // 2. Update ONLY the password in that object
      const updatedAccount = { ...savedAccount, password: passwordData.newPassword };
      
      // 3. Save it back to the SAME key the login page uses
      localStorage.setItem("userAccount", JSON.stringify(updatedAccount));

      alert("Verification successful! Password updated. Use your new password next time you login.");
      setStep("input");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOtpInput("");
    } else {
      alert("Invalid OTP. Please check your email.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Currency Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 h-full flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-blue-600">Regional Preferences</h3>
          <div className="flex-grow">
            <label className="block mb-2 font-semibold text-gray-700">Select Currency Type</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border p-3 w-full rounded-lg mb-4 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
              <option value="JPY">¥ JPY (Japanese Yen)</option>
              <option value="CNY">¥ CNY (Chinese Yuan)</option>
              <option value="AUD">A$ AUD (Australian Dollar)</option>
              <option value="CAD">C$ CAD (Canadian Dollar)</option>
              <option value="CHF">Fr CHF (Swiss Franc)</option>
              <option value="SGD">S$ SGD (Singapore Dollar)</option>
              <option value="HKD">HK$ HKD (Hong Kong Dollar)</option>
              <option value="NZD">NZ$ NZD (New Zealand Dollar)</option>
              <option value="KRW">₩ KRW (South Korean Won)</option>
              <option value="SEK">kr SEK (Swedish Krona)</option>
              <option value="NOK">kr NOK (Norwegian Krone)</option>
              <option value="DKK">kr DKK (Danish Krone)</option>
              <option value="ZAR">R ZAR (South African Rand)</option>
              <option value="BRL">R$ BRL (Brazilian Real)</option>
              <option value="MXN">MX$ MXN (Mexican Peso)</option>
              <option value="AED">د.إ AED (UAE Dirham)</option>
              <option value="SAR">﷼ SAR (Saudi Riyal)</option>
              <option value="QAR">﷼ QAR (Qatari Riyal)</option>
              <option value="KWD">د.ك KWD (Kuwaiti Dinar)</option>
              <option value="BHD">BD BHD (Bahraini Dinar)</option>
              <option value="OMR">﷼ OMR (Omani Rial)</option>
              <option value="THB">฿ THB (Thai Baht)</option>
              <option value="MYR">RM MYR (Malaysian Ringgit)</option>
              <option value="IDR">Rp IDR (Indonesian Rupiah)</option>
              <option value="PHP">₱ PHP (Philippine Peso)</option>
              <option value="TWD">NT$ TWD (Taiwan Dollar)</option>
              <option value="TRY">₺ TRY (Turkish Lira)</option>
              <option value="RUB">₽ RUB (Russian Ruble)</option>
              <option value="PLN">zł PLN (Polish Zloty)</option>
              <option value="CZK">Kč CZK (Czech Koruna)</option>
              <option value="HUF">Ft HUF (Hungarian Forint)</option>
              <option value="ILS">₪ ILS (Israeli Shekel)</option>
              <option value="EGP">E£ EGP (Egyptian Pound)</option>
              <option value="NGN">₦ NGN (Nigerian Naira)</option>
              <option value="KES">KSh KES (Kenyan Shilling)</option>
              <option value="LKR">Rs LKR (Sri Lankan Rupee)</option>
              <option value="PKR">₨ PKR (Pakistani Rupee)</option>
              <option value="BDT">৳ BDT (Bangladeshi Taka)</option>
              <option value="NPR">Rs NPR (Nepalese Rupee)</option>
              <option value="VND">₫ VND (Vietnamese Dong)</option>
              <option value="ARS">$ ARS (Argentine Peso)</option>
              <option value="CLP">$ CLP (Chilean Peso)</option>
              <option value="COP">$ COP (Colombian Peso)</option>
            </select>
          </div>
          <button onClick={saveCurrency} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-md mt-4">
            Update Currency
          </button>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500 h-full flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-red-600">Security & Login</h3>
          
          {step === "input" ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <input 
                  type="password" name="currentPassword" placeholder="••••••••"
                  className="border p-2 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none" 
                  onChange={handlePasswordChange} required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input 
                  type="password" name="newPassword" placeholder="New Password"
                  className="border p-2 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none" 
                  onChange={handlePasswordChange} required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                <input 
                  type="password" name="confirmPassword" placeholder="Confirm New Password"
                  className="border p-2 w-full rounded-lg bg-gray-50 focus:border-red-400 outline-none" 
                  onChange={handlePasswordChange} required 
                />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-all shadow-md mt-2">
                Send OTP to {userEmail || "Email"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">An OTP has been sent to</p>
                <p className="font-bold text-gray-800">{userEmail}</p>
              </div>
              <input 
                type="text" maxLength="4" placeholder="0000"
                value={otpInput} onChange={(e) => setOtpInput(e.target.value)}
                className="border-2 border-red-200 p-4 w-full rounded-lg text-center text-3xl font-mono tracking-[1rem] focus:border-red-500 outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setStep("input")} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">
                  Cancel
                </button>
                <button onClick={handleVerifyAndSave} className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold">
                  Verify & Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;