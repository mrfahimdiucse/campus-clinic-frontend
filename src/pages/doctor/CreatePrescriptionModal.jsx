import React, { useState } from 'react';
import { createPrescription } from '../../services/prescriptionService';

const CreatePrescriptionModal = ({ appointment, onClose, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-1', duration: '7 days' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // নতুন ঔষধ যোগ করার ফাংশন
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-1', duration: '7 days' }]);
  };

  // নির্দিষ্ট ঔষধ ডিলিট করার ফাংশন
  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // ইনপুট চেঞ্জ হ্যান্ডলার
  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createPrescription({
        appointmentId: appointment._id,
        patientId: appointment.patient._id,
        patientEmail: appointment.patient.email,
        diagnosis,
        instructions,
        medicines,
      });

      alert('প্রেসক্রিপশন সফলভাবে তৈরি হয়েছে এবং রোগীর ইমেইলে পাঠানো হয়েছে!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'প্রেসক্রিপশন সাবমিট করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div>
            <h3 className="text-xl font-bold">ডিজিটাল প্রেসক্রিপশন লিখুন</h3>
            <p className="text-sm text-gray-500">
              রোগী: {appointment?.patient?.name} ({appointment?.patient?.email})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ✕
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">রোগের নাম / ডায়াগনোসিস (Diagnosis)</label>
            <input
              type="text"
              required
              placeholder="যেমন: Viral Fever, Acidity..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Medicines Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">ঔষধের তালিকা (Medicines)</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 font-semibold"
              >
                + আরও ঔষধ যোগ করুন
              </button>
            </div>

            {medicines.map((med, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center bg-gray-50 p-2.5 rounded-lg border">
                <input
                  type="text"
                  placeholder="ঔষধের নাম"
                  required
                  value={med.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="flex-1 border p-2 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="ডোজ (যেমন: 1-0-1)"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  className="w-28 border p-2 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="কতদিন (যেমন: 7 days)"
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                  className="w-28 border p-2 rounded-md text-sm"
                />
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">পরামর্শ / বিশেষ নির্দেশনা (Advice)</label>
            <textarea
              rows="3"
              placeholder="যেমন: প্রচুর পানি খাবেন, ঠাণ্ডা খাবার এড়িয়ে চলবেন..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'প্রেসক্রিপশন সাবমিট ও ইমেইল করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrescriptionModal;