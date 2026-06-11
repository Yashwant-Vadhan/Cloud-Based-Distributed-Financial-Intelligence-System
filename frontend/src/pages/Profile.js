import { useState, useEffect } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage } from "../utils/AppContext";

function Profile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: ""
  });

  const [editMode, setEditMode] = useState(false);
  const AUTH_URL = process.env.REACT_APP_AUTH_URL;
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setProfile({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || ""
        });
        setEditMode(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setEditMode(true);
      }
    };
    fetchProfile();
  }, [AUTH_URL]);

  const handleSave = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`${AUTH_URL}/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("userProfile", JSON.stringify(data));
        setEditMode(false);
        toast.success(t("profileSavedSuccess"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || t("profileSaveFailError"));
      }
    } catch (err) {
      toast.error(t("profileSaveError"));
    }
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">{t("userProfileTitle")}</h2>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        
        {/* Name Input Group */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {editMode ? t("enterUsernameLabel") : t("username")}
          </label>
          <input
            value={profile.username}
            disabled={!editMode}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className={`border p-3 w-full rounded-lg transition-all ${
              editMode ? "border-blue-400 bg-white" : "border-transparent bg-gray-50 cursor-default"
            }`}
          />
        </div>

        {/* Email Input Group */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            {editMode ? t("enterEmailLabel") : t("emailIdLabel")}
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
            {editMode ? t("enterMobileLabel") : t("mobileNumberLabel")}
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
              {t("saveDetailsBtn")}
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
            >
              {t("editProfileBtn")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;