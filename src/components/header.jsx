import React from 'react'

const Header = ({ onHome, onAdd }) => {
  return (
    <nav className="flex items-center justify-between py-4 px-6 sticky top-0 bg-white z-10 border-b border-dark-100">
      <ul className="flex space-x-8">
        <li>
          <button onClick={onHome} className="text-amber-500 hover:underline font-medium">Home</button>
        </li>
      </ul>
      <div>
        <button
          onClick={onAdd}
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          title="Add Family Member"
        >
          Add Member
        </button>
      </div>
    </nav>
  )
}

export default Header