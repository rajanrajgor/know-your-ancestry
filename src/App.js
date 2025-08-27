import { useState } from 'react';
import Footer from './components/footer';
import MembersList from './components/MembersList';
import MemberForm from './components/MemberForm';

function App() {
  const [view, setView] = useState('list');
  const [editId, setEditId] = useState(null);

  const handleHome = () => {
    setView('list');
    setEditId(null);
  };

  const handleAdd = () => {
    setEditId(null);
    setView('form');
  };

  const handleEdit = (id) => {
    setEditId(id);
    setView('form');
  };

  const handleSaved = () => {
    setView('list');
    setEditId(null);
  };

  const handleCancel = () => {
    setView('list');
    setEditId(null);
  };

  return (
    <div className="App flex flex-col items-stretch h-screen overflow-y-hidden text-start">
      <main className="flex-grow overflow-y-auto">
        {view === 'list' ? (
          <MembersList onEdit={handleEdit} onHome={handleHome} onAdd={handleAdd} />
        ) : (
          <MemberForm id={editId} onCancel={handleCancel} onSaved={handleSaved} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
