// src/components/MembersList.jsx
import { useEffect, useState } from 'react';

const MembersList = ({ onEdit }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (err) {
      setError('Failed to connect to server');
      // eslint-disable-next-line no-console
      console.error('Fetch error:', err);
    }
  };

  const deleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/members/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setSuccess('Member deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete member');
      }
    } catch (err) {
      setError('Network error occurred');
      // eslint-disable-next-line no-console
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-stretch justify-center bg-gray-50 py-8">
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

        {members.length === 0 ? (
          <div className="min-w-full min-h-full flex items-center justify-center p-4">
            <div className="bg-white p-4 md:p-12 rounded-lg border border-gray-200 text-center">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-500 text-lg mb-2">There are no family members added yet.</p>
              <p className="text-gray-400 mb-6">Add a new member to start building your family tree.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-8">
              Family Members ({members.length})
            </h2>
            <div className="flex flex-col gap-6">
              {members.map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">

                    <div className="">
                      <div className="flex flex-col gap-4">
                        <div className="w-6/12 md:w-full">
                          <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
                            {member.photo ? (
                              <img src={member.photo} alt={`${member.name} photo`} className="w-full h-full object-cover object-center" />
                            ) : (
                              member.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl lg:text-2xl font-semibold text-gray-800">
                          {member.name}
                        </h3>
                      </div>
                    </div>

                    <div className="md:col-span-2">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Contect Number</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">{member.phone && String(member.phone).trim() ? member.phone : 'N/A'}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Date of Birth</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.dateOfBirth && String(member.dateOfBirth).trim() ? member.dateOfBirth : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Time of Birth</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.timeOfBirth && String(member.timeOfBirth).trim() ? member.timeOfBirth : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Place of Birth</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.placeOfBirth && String(member.placeOfBirth).trim() ? member.placeOfBirth : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Address</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.address && String(member.address).trim() ? member.address : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">ZIP / Postal Code</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.zipPostalCode && String(member.zipPostalCode).trim() ? member.zipPostalCode : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Country</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.country && String(member.country).trim() ? member.country : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Relation</p>
                          <span className="text-base md:text-lg font-semibold text-dark-700">
                            {member.relation && member.relation.type && member.relation.relatedMemberId ? (
                              <>
                                {member.relation.type} of {(() => {
                                  const related = members.find((m) => m.id === member.relation.relatedMemberId);
                                  return related ? related.name : 'Unknown';
                                })()}
                              </>
                            ) : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-regular text-gray-500">Added on</p>
                          <span className="text-base font-semibold text-dark-700">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                      </div>

                      <div className="flex justify-end items-center gap-2 lg:gap-4 pt-8">
                          <button
                            onClick={() => deleteMember(member.id, member.name)}
                            className="text-xs lg:text-base lg:leading-[1.25] font-semibold bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded-lg transition-all"
                            title={`Delete ${member.name}`}
                          >
                            Delete Member
                          </button>
                          <button
                            onClick={() => onEdit && onEdit(member.id)}
                            className="text-xs lg:text-base lg:leading-[1.25] font-semibold bg-amber-400 text-dark-500 hover:bg-amber-500 py-2 px-4 rounded-lg transition-all"
                          >
                            Edit Member
                          </button>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

    </div>
  );
};

export default MembersList;

