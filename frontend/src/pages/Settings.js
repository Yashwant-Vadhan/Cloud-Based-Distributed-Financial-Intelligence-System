function Settings() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">Settings</h2>

      <div className="bg-white p-6 rounded-xl shadow-lg w-1/2">

        <label className="block mb-2 font-semibold">User Name</label>
        <input className="border p-2 w-full rounded-lg mb-4" />

        <label className="block mb-2 font-semibold">Email</label>
        <input className="border p-2 w-full rounded-lg mb-4" />

        <label className="block mb-2 font-semibold">Currency</label>
        <select className="border p-2 w-full rounded-lg mb-4">
          <option>₹ INR</option>
          <option>$ USD</option>
          <option>€ Euro</option>
        </select>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Save Changes
        </button>

      </div>

    </div>
  );
}

export default Settings;