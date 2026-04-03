import { useState, useEffect } from "react";

function Profile() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userProfile"));
    if (saved) {
      setProfile(saved);
      setEditMode(false);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setEditMode(false);
  };

  return (
    <div className="p-6">

      <h2 className="text-3xl font-bold mb-6">User Profile</h2>

      <div className="bg-white p-6 rounded-xl shadow-lg w-1/2">

        <input
          value={profile.name}
          disabled={!editMode}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="border p-2 w-full mb-4"
          placeholder="Name"
        />

        <input
          value={profile.email}
          disabled={!editMode}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          className="border p-2 w-full mb-4"
          placeholder="Email"
        />

        <input
          value={profile.phone}
          disabled={!editMode}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="border p-2 w-full mb-4"
          placeholder="Phone"
        />

        {editMode ? (
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        )}

      </div>

    </div>
  );
}

export default Profile;
