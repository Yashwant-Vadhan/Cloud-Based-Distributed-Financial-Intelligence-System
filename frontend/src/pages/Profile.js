import { useState, useEffect } from "react";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userProfile"));
    if (saved) {
      setProfile(saved);
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setEditMode(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">User Profile</h2>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        
        {/* Name Input Group */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {editMode ? "Enter the Name" : "Name"}
          </label>
          <input
            value={profile.name}
            disabled={!editMode}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className={`border p-3 w-full rounded-lg transition-all ${
              editMode ? "border-blue-400 bg-white" : "border-transparent bg-gray-50 cursor-default"
            }`}
          />
        </div>

        {/* Email Input Group */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {editMode ? "Enter the Email ID" : "Email ID"}
          </label>
          <input
            type="email"
            value={profile.email}
            disabled={!editMode}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={`border p-3 w-full rounded-lg transition-all ${
              editMode ? "border-blue-400 bg-white" : "border-transparent bg-gray-50 cursor-default"
            }`}
          />
        </div>

        {/* Phone Input Group */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {editMode ? "Enter the Mobile Number" : "Mobile Number"}
          </label>
          <input
            type="tel"
            value={profile.phone}
            disabled={!editMode}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={`border p-3 w-full rounded-lg transition-all ${
              editMode ? "border-blue-400 bg-white" : "border-transparent bg-gray-50 cursor-default"
            }`}
          />
        </div>

        <div className="flex gap-4">
          {editMode ? (
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
            >
              Save Details
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;