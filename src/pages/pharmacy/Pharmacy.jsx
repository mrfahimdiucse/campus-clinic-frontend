import { useState, useEffect } from 'react';
import axios from 'axios';
import EmptyState from '../../components/common/EmptyState';

const Pharmacy = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Order Modal States
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pharmacy`);
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to place an order.');
      setOrderLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/pharmacy/order`,
        {
          items: [
            {
              medicineId: selectedMedicine._id,
              quantity: Number(quantity),
            },
          ],
          phone,
          shippingAddress,
          paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Order placed successfully! A rider will accept your delivery soon.');
      setSelectedMedicine(null);
      setQuantity(1);
      setPhone('');
      setShippingAddress('');
      setPaymentMethod('Cash on Delivery');
      fetchMedicines(); // Refresh stock
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    (m?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Banner & Search */}
      <div className="bg-primary text-primary-content p-8 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campus Pharmacy</h1>
          <p className="opacity-90 mt-1">Find and order essential medicines directly from campus store.</p>
        </div>
        <input
          type="text"
          placeholder="Search medicine..."
          className="input input-bordered text-black w-full md:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <EmptyState message={medicines.length === 0 ? 'No medicines in inventory.' : 'No medicines match your search.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedicines?.map((med) => (
            <div key={med._id} className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <span className="badge badge-outline badge-primary text-xs font-semibold w-fit">
                  {med.category || 'General'}
                </span>
                <h2 className="card-title text-xl font-bold mt-1">{med.name}</h2>
                <p className="text-xs text-gray-500 min-h-[36px]">{med.description}</p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-black text-primary">৳{med.price}</span>
                  <span className={`text-xs font-semibold ${med.stock <= 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                    In Stock ({med.stock})
                  </span>
                </div>

                <button
                  disabled={med.stock <= 0}
                  onClick={() => setSelectedMedicine(med)}
                  className="btn btn-primary w-full mt-4 text-white"
                >
                  {med.stock <= 0 ? 'Out of Stock' : 'Request Medicine'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal with Payment Options */}
      {selectedMedicine && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md border border-base-300 shadow-xl">
            <h3 className="font-bold text-xl text-primary mb-1">Order {selectedMedicine.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Price: ৳{selectedMedicine.price} per unit</p>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="label font-semibold text-xs">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedMedicine.stock}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label font-semibold text-xs">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label font-semibold text-xs">Delivery Address / Room No.</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Building Name, Hall, Room No."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="textarea textarea-bordered w-full"
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="label font-semibold text-xs">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`cursor-pointer border p-3 rounded-lg flex items-center justify-between ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/10' : ''}`}>
                    <span className="text-xs font-bold">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="radio radio-primary radio-xs"
                    />
                  </label>

                  <label className={`cursor-pointer border p-3 rounded-lg flex items-center justify-between ${paymentMethod === 'Online Payment' ? 'border-primary bg-primary/10' : ''}`}>
                    <span className="text-xs font-bold">bKash / Online</span>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Online Payment'}
                      onChange={() => setPaymentMethod('Online Payment')}
                      className="radio radio-primary radio-xs"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-base-200 p-3 rounded-lg flex justify-between items-center font-bold">
                <span>Total Payable:</span>
                <span className="text-primary text-xl">৳{selectedMedicine.price * quantity}</span>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setSelectedMedicine(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="btn btn-primary btn-sm text-white"
                >
                  {orderLoading ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;