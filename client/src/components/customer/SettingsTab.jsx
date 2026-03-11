import React from 'react';

const SettingsTab = ({ currentUser }) => {
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('serviceFinderToken');
    const formData = new FormData(e.target);
    const updates = { name: formData.get('name'), phone: formData.get('phone') };
    
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
      } else {
          alert(data.message || "Failed to update profile.");
      }
    } catch (err) { alert("Error saving profile"); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Update your personal information and contact details.</p>
      </div>

      <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input name="name" type="text" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
            <input name="phone" type="tel" defaultValue={currentUser?.phone} placeholder="Add your phone number" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email (Cannot be changed)</label>
            <input type="email" value={currentUser?.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none" />
          </div>
        </div>

        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 shadow-md">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsTab;