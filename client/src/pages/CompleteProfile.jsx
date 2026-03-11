import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    serviceType: 'Cleaning',
    experience: '',
    location: '',
    price: '',
    phone: '', 
    about: '',
    image: currentUser?.image || '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const categories = ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Appliance Repair'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image size must be less than 5MB.");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, isProfileComplete: true })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, token); 
        alert("Profile completed successfully!");
        navigate('/dashboard'); 
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (error) {
      alert("A server error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSignup = async () => {
    const isConfirmed = window.confirm("Are you sure you want to cancel? Your account will be deleted and you will need to sign up again.");
    if (!isConfirmed) return;

    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        if (logout) logout();
        sessionStorage.removeItem('serviceFinderUser');
        sessionStorage.removeItem('serviceFinderToken');
        navigate('/');
      } else {
        alert("Failed to cancel sign up. Please try again.");
      }
    } catch (error) {
      alert("A server error occurred while cancelling.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f1117] font-display transition-colors">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Complete Your Profile</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Tell customers about your expertise so they can book your services.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Professional Title</label>
                <input name="title" type="text" required placeholder="e.g. Master Plumber" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Service Category</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
                <input name="phone" type="tel" required placeholder="10-digit number" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Experience (Years)</label>
                <input name="experience" type="number" required min="0" placeholder="e.g. 5" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Base Price (₹/hr)</label>
                <input name="price" type="number" required min="0" placeholder="e.g. 499" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">City / Location</label>
              <input name="location" type="text" required placeholder="e.g. Mumbai, MH" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">About You & Your Services</label>
              <textarea name="about" rows="4" required placeholder="Describe your expertise and what makes you reliable..." value={formData.about} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>
            
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Profile Photo</label>
                <div className="relative h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                  {formData.image && formData.image.startsWith('data:image') ? (
                    <>
                      <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                         <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center p-4">
                      <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">add_a_photo</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Photo</span>
                      <span className="text-xs text-slate-500 mt-1">JPEG, PNG (Max 5MB)</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-blue-600 transition-colors">
                  {isLoading ? 'Saving...' : 'Publish Profile'}
                </button>
                <button type="button" onClick={handleCancelSignup} className="w-full py-4 px-4 rounded-xl text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Cancel Sign Up
                </button>
              </div>

            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CompleteProfile;