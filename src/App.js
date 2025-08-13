
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MemberForm from './components/MemberForm';

function App() {
  return (
    <div className="App flex flex-col items-stretch h-screen overflow-y-hidden text-start">
      <Router>
        <Header />
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<MemberForm />} />
            <Route path="/edit/:id" element={<MemberForm />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
