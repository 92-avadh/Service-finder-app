import React, { useState } from 'react';

const CreateInvoice = ({ booking, onClose, onSuccess }) => {
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX: Force strict number parsing and default to 0
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', amount: '' }]);
  
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const submitBill = async () => {
    setIsSubmitting(true);
    try {
      // FIX: Ensure all amounts are submitted as numbers to the backend
      const formattedItems = items.map(item => ({
        description: item.description,
        amount: parseFloat(item.amount) || 0
      }));

      const token = sessionStorage.getItem('serviceFinderToken');
      const res = await fetch(`http://localhost:5000/api/bookings/${booking._id}/bill`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ invoiceItems: formattedItems })
      });

      if (res.ok) {
        alert("Bill sent to customer successfully!");
        onSuccess(); 
      } else {
        alert("Failed to send bill.");
      }
    } catch (error) {
      alert("Error sending bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black dark:text-white">Create Itemized Bill</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Description (e.g. Parts, Labor)" 
                className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex-1 outline-none focus:border-primary dark:text-white"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
              <input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="₹" 
                className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl w-24 outline-none focus:border-primary dark:text-white"
                value={item.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
              />
              {items.length > 1 && (
                <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button onClick={addItem} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mb-6">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Item
        </button>
        
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
          <div className="flex flex-col">
            <span className="text-slate-500 text-sm">Total Amount</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={submitBill} 
            disabled={isSubmitting || totalAmount <= 0 || items.some(i => !i.description || !i.amount)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Sending...' : 'Send Bill'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateInvoice;