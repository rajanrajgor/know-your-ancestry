// src/components/MemberForm.jsx
import { useEffect, useRef, useState } from 'react';

const MemberForm = ({ id, onCancel, onSaved }) => {
  const isEditMode = Boolean(id);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    zip: '',
    country: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    addRelation: false,
    relatedMemberId: '',
    relationType: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    if (!members || members.length === 0) return;
    const current = members.find((m) => m.id === id);
    if (!current) {
      setError('Member not found');
      return;
    }
    setFormData({
      name: current.name || '',
      phone: current.phone || '',
      address: current.address || '',
      zip: current.zipPostalCode || '',
      country: current.country || '',
      dateOfBirth: current.dateOfBirth || '',
      timeOfBirth: current.timeOfBirth || '',
      placeOfBirth: current.placeOfBirth || '',
      addRelation: !!current.relation,
      relatedMemberId: current.relation?.relatedMemberId || '',
      relationType: current.relation?.type || '',
      photo: current.photo || ''
    });
    setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 0);
  }, [isEditMode, id, members]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        setError('Failed to fetch members');
      }
    } catch (err) {
      setError('Failed to connect to server');
      // eslint-disable-next-line no-console
      console.error('Fetch error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, photo: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (formData.addRelation) {
      if (!formData.relatedMemberId || !formData.relationType) {
        setError('Please select a member and the relation type.');
        return;
      }
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const url = isEditMode ? `http://localhost:5000/api/members/${id}` : 'http://localhost:5000/api/members';
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify((() => {
          const payload = {
            name: formData.name,
            phone: formData.phone
          };
          if (formData.address !== '') payload.address = formData.address;
          if (formData.zip !== '') payload.zipPostalCode = formData.zip;
          if (formData.country !== '') payload.country = formData.country;
          if (formData.dateOfBirth !== '') payload.dateOfBirth = formData.dateOfBirth;
          if (formData.timeOfBirth !== '') payload.timeOfBirth = formData.timeOfBirth;
          if (formData.placeOfBirth !== '') payload.placeOfBirth = formData.placeOfBirth;
          if (formData.photo !== '') payload.photo = formData.photo;
          if (formData.addRelation && formData.relatedMemberId && formData.relationType) {
            payload.relation = {
              relatedMemberId: formData.relatedMemberId,
              type: formData.relationType
            };
          } else if (isEditMode) {
            payload.relation = null;
          }
          return payload;
        })())
      });
      if (response.ok) {
         if (!isEditMode) {
          setFormData({
            name: '',
            phone: '',
            address: '',
            zip: '',
            country: '',
            dateOfBirth: '',
            timeOfBirth: '',
            placeOfBirth: '',
            addRelation: false,
            relatedMemberId: '',
            relationType: '',
            photo: ''
          });
        }
         if (onSaved) onSaved();
      } else {
        const contentType = response.headers.get('content-type') || '';
        let errorMessage = isEditMode ? 'Failed to update member' : 'Failed to add member';
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error - make sure server is running');
      // eslint-disable-next-line no-console
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md" ref={formRef}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            {isEditMode ? 'Edit Member' : 'Add Member'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-stretch gap-4">
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photo
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {formData.photo && (
                  <img src={formData.photo} alt="Preview" className="mt-2 h-16 w-16 rounded-full object-cover border" />
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name<span className="text-base text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  ref={nameInputRef}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="timeOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Birth
                </label>
                <input
                  type="time"
                  id="timeOfBirth"
                  name="timeOfBirth"
                  value={formData.timeOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  id="placeOfBirth"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="City, State/Country"
                />
              </div>
            </div>


            <div className="pt-4 mt-2 border-t border-gray-100">
              <label className="inline-flex items-center gap-2 text-lg text-blue-700">
                <input
                  type="checkbox"
                  name="addRelation"
                  checked={formData.addRelation}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Add Relation
              </label>

              {formData.addRelation && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="relatedMemberId" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Member
                    </label>
                    <select
                      id="relatedMemberId"
                      name="relatedMemberId"
                      value={formData.relatedMemberId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required={formData.addRelation}
                    >
                      <option value="" selected hidden>Select Member</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="relationType" className="block text-sm font-medium text-gray-700 mb-2">
                      Relation
                    </label>
                    <select
                      id="relationType"
                      name="relationType"
                      value={formData.relationType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required={formData.addRelation}
                    >
                      <option value="" selected hidden>Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Additional Details</h3>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Street, City, State"
                />
              </div>

              <div className="flex flex-col items-stretch gap-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 94107"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., United States"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs lg:text-base lg:leading-[1.25] font-semibold text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  isEditMode ? 'Saving...' : 'Adding...'
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Family Member'
                )}
              </button>
              <button
                type="button"
                onClick={() => onCancel && onCancel()}
                className="py-2 px-4 rounded-lg border border-gray-300 text-xs lg:text-base lg:leading-[1.25] font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberForm;

