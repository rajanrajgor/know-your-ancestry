// src/components/MemberManager.js
import { useState, useEffect, useRef } from 'react';

const MemberManager = () => {
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

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Focus after a brief timeout to allow scroll
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus({ preventScroll: true });
      }
    }, 300);
  };

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        setError('Failed to fetch members');
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error('Fetch error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, photo: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    // If adding a relation, ensure all relation fields are provided
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
      const response = await fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify((() => {
          const payload = {
            name: formData.name,
            phone: formData.phone
          };
          if (formData.address) payload.address = formData.address;
          if (formData.zip) payload.zipPostalCode = formData.zip;
          if (formData.country) payload.country = formData.country;
          if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
          if (formData.timeOfBirth) payload.timeOfBirth = formData.timeOfBirth;
          if (formData.placeOfBirth) payload.placeOfBirth = formData.placeOfBirth;
          if (formData.photo) payload.photo = formData.photo; // base64 data URL
          if (formData.addRelation && formData.relatedMemberId && formData.relationType) {
            payload.relation = {
              relatedMemberId: formData.relatedMemberId,
              type: formData.relationType,
            };
          }
          return payload;
        })()),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const newMember = await response.json();
          // Ensure relation is present on the new member for UI display
          if (!newMember.relation && formData.addRelation) {
            newMember.relation = {
              relatedMemberId: formData.relatedMemberId,
              type: formData.relationType,
            };
          }
          setMembers(prev => [...prev, newMember]);
        } else {
          await fetchMembers();
        }
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
        setSuccess('Member added successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const contentType = response.headers.get('content-type') || '';
        let errorMessage = 'Failed to add member';
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError('Network error - make sure server is running');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/members/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers(prev => prev.filter(member => member.id !== id));
        setSuccess('Member deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete member');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">🌳 Family Tree Builder</h1>
          <p className="text-lg opacity-90">Add and manage family members to build your ancestry tree</p>
        </div> */}

        {/* Status Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Member Form */}
          <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md" ref={formRef}>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">➕</span>
                Add Family Member
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
                      Full Name *
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

                <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Additional Details</h3>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (optional)
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

                  <div className="pt-2">
                    <label className="inline-flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="addRelation"
                        checked={formData.addRelation}
                        onChange={handleInputChange}
                        className="mr-2"
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
                            <option value="">-- Choose member --</option>
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
                            <option value="">-- Select relation --</option>
                            <option value="Father">Father</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? (
                    <>⏳ Adding...</>
                  ) : (
                    <>✅ Add Family Member</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>
                  Family Members ({members.length})
                </h2>
              </div>
              
              <div className="p-6">
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="text-gray-500 text-lg mb-2">There are no family members added yet.</p>
                    <p className="text-gray-400 mb-6">Add a new member to start building your family tree.</p>
                    <button
                      onClick={scrollToForm}
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    >
                      ➕ Add Family Member
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {member.photo ? (
                                <img src={member.photo} alt={`${member.name} photo`} className="w-full h-full object-cover" />
                              ) : (
                                member.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {member.name}
                              </h3>
                              
                              {/* Email field removed from schema */}
                              
                              {member.phone && (
                                <div className="flex items-center text-gray-600 mt-1">
                                  <span className="mr-2">📱</span>
                                  <span className="text-sm">{member.phone}</span>
                                </div>
                              )}
                              {member.relation && member.relation.type && member.relation.relatedMemberId && (
                                <div className="flex items-center text-gray-600 mt-1">
                                  <span className="mr-2">👪</span>
                                  <span className="text-sm">
                                    {member.relation.type} of {(() => {
                                      const related = members.find(m => m.id === member.relation.relatedMemberId);
                                      return related ? related.name : 'Unknown';
                                    })()}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center text-gray-500 text-xs mt-2">
                                <span className="mr-2">📅</span>
                                <span>
                                  Added: {new Date(member.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteMember(member.id, member.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                            title={`Delete ${member.name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManager;