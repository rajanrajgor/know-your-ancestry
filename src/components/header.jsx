import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <nav className="flex items-center justify-between py-4 px-6 sticky top-0 bg-white z-10 border-b border-dark-100">
      <ul className="flex space-x-8">
        <li>
          <Link to="/" className="text-amber-500 hover:underline font-medium">Home</Link>
        </li>
      </ul>
      <div>
        <Link
          to="/add"
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          title="Add Family Member"
        >
          Add Member
        </Link>
      </div>
    </nav>
  )
}

export default Header