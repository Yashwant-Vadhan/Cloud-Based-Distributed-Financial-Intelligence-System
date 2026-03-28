function Profile() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">User Profile</h2>

      <div className="bg-white p-6 rounded-xl shadow-lg w-1/2">

        <label className="block mb-2 font-semibold">Name</label>
        <input
          className="border p-2 w-full rounded-lg mb-4"
          placeholder="Enter your name"
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          className="border p-2 w-full rounded-lg mb-4"
          placeholder="Enter your email"
        />

        <label className="block mb-2 font-semibold">Phone Number</label>
        <input
          className="border p-2 w-full rounded-lg mb-4"
          placeholder="Enter phone number"
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Save Profile
        </button>

      </div>

    </div>
  );
}

export default Profile;