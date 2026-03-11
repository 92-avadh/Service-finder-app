import React from 'react';

const ProfileTab = ({ currentUser }) => {
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('serviceFinderToken');
    const formData = new FormData(e.target);
    const updates = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
          sessionStorage.setItem('serviceFinderUser', JSON.stringify(data.user));
          alert("Profile updated successfully!");
          window.location.reload(); 
      }
    } catch (err) { alert("Error saving profile"); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Professional Profile</h2>
        <p className="text-slate-500 dark:text-slate-400">Keep your details fresh to attract more customers.</p>
      </div>

      <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input name="name" type="text" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Professional Title</label>
            <input name="title" type="text" defaultValue={currentUser?.title} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
            <input name="phone" type="tel" defaultValue={currentUser?.phone} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Base Price (₹/hr)</label>
            <input name="price" type="number" defaultValue={currentUser?.price} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
            <input name="location" type="text" defaultValue={currentUser?.location} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">About Your Services</label>
          <textarea name="about" rows="4" defaultValue={currentUser?.about} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none"></textarea>
        </div>

        <button type="submit" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-md">
          Save Profile Updates
        </button>
      </form>
    </div>
  );
};

export default ProfileTab;