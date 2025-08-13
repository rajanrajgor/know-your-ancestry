// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Increase JSON payload limit to allow base64 photos
app.use(express.json({ limit: '10mb' }));

const dataFilePath = path.join(__dirname, 'data', 'members.json');

const ensureDataDir = () => {
  const dataDir = path.dirname(dataFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const normalizeMember = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone ? String(raw.phone).trim() : '',
    address: raw.address ? String(raw.address).trim() : '',
    zipPostalCode: raw.zipPostalCode ? String(raw.zipPostalCode).trim() : (raw.zip ? String(raw.zip).trim() : ''),
    country: raw.country ? String(raw.country).trim() : '',
    photo: raw.photo || '',
    dateOfBirth: raw.dateOfBirth ? String(raw.dateOfBirth).trim() : '',
    timeOfBirth: raw.timeOfBirth ? String(raw.timeOfBirth).trim() : '',
    placeOfBirth: raw.placeOfBirth ? String(raw.placeOfBirth).trim() : '',
    relation: raw.relation,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
  };
};

const loadMembers = () => {
  ensureDataDir();
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      const parsed = JSON.parse(data || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeMember) : [];
    }
    return [];
  } catch (error) {
    console.error('Error loading members:', error);
    return [];
  }
};

const saveMembers = (members) => {
  ensureDataDir();
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2));
  } catch (error) {
    console.error('Error saving members:', error);
    throw error;
  }
};

// GET /api/members - Get all members
app.get('/api/members', (req, res) => {
  try {
    const members = loadMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/members - Add new member
app.post('/api/members', (req, res) => {
  try {
    const { name, phone, address, zipPostalCode, country, photo, relation, dateOfBirth, timeOfBirth, placeOfBirth } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newMember = {
      id: uuidv4(),
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      address: address ? String(address).trim() : '',
      zipPostalCode: zipPostalCode ? String(zipPostalCode).trim() : '',
      country: country ? String(country).trim() : '',
      photo: photo || '',
      dateOfBirth: dateOfBirth ? String(dateOfBirth).trim() : '',
      timeOfBirth: timeOfBirth ? String(timeOfBirth).trim() : '',
      placeOfBirth: placeOfBirth ? String(placeOfBirth).trim() : '',
      createdAt: new Date().toISOString()
    };

    // Persist relation if provided and valid
    if (
      relation &&
      typeof relation === 'object' &&
      relation.relatedMemberId &&
      relation.type
    ) {
      newMember.relation = {
        relatedMemberId: String(relation.relatedMemberId),
        type: String(relation.type),
      };
    }

    const currentMembers = loadMembers();
    currentMembers.push(newMember);
    saveMembers(currentMembers);

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Helper: collect descendant ids (children and their children) of a member
// Descendants are defined as members whose relation.relatedMemberId equals the
// given id, and relation.type is one of 'Son' or 'Daughter'. This walks
// recursively to include grand-children, etc.
const collectDescendantIds = (members, rootId) => {
  const idsToDelete = new Set([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const currentId = stack.pop();
    const children = members.filter(m =>
      m.relation &&
      m.relation.relatedMemberId === currentId &&
      (m.relation.type === 'Son' || m.relation.type === 'Daughter')
    );
    for (const child of children) {
      if (!idsToDelete.has(child.id)) {
        idsToDelete.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return Array.from(idsToDelete);
};

// GET /api/members/:id/dependents - Preview which members would be deleted in a cascade
app.get('/api/members/:id/dependents', (req, res) => {
  try {
    const { id } = req.params;
    const currentMembers = loadMembers();
    const exists = currentMembers.some(m => m.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Member not found' });
    }
    const ids = collectDescendantIds(currentMembers, id);
    const affected = currentMembers.filter(m => ids.includes(m.id));
    res.json({ ids, affected, count: affected.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute dependents' });
  }
});

// DELETE /api/members/:id - Delete member with cascade to descendants
app.delete('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentMembers = loadMembers();
    const target = currentMembers.find(m => m.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const idsToDelete = collectDescendantIds(currentMembers, id);
    const membersAfterDelete = currentMembers.filter(m => !idsToDelete.includes(m.id));

    saveMembers(membersAfterDelete);
    res.json({ message: 'Member(s) deleted successfully', deletedIds: idsToDelete, deletedCount: idsToDelete.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete member(s)' });
  }
});

// PUT /api/members/:id - Update member
app.put('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const membersToUpdate = loadMembers();
    
    const memberIndex = membersToUpdate.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    membersToUpdate[memberIndex] = {
      ...membersToUpdate[memberIndex],
      name: updateData.name ? String(updateData.name).trim() : membersToUpdate[memberIndex].name,
      phone: updateData.phone ? String(updateData.phone).trim() : membersToUpdate[memberIndex].phone,
      address: updateData.address !== undefined ? String(updateData.address).trim() : membersToUpdate[memberIndex].address || '',
      zipPostalCode: updateData.zipPostalCode !== undefined ? String(updateData.zipPostalCode).trim() : membersToUpdate[memberIndex].zipPostalCode || '',
      country: updateData.country !== undefined ? String(updateData.country).trim() : membersToUpdate[memberIndex].country || '',
      photo: updateData.photo !== undefined ? updateData.photo : membersToUpdate[memberIndex].photo || '',
      dateOfBirth: updateData.dateOfBirth !== undefined ? String(updateData.dateOfBirth).trim() : membersToUpdate[memberIndex].dateOfBirth || '',
      timeOfBirth: updateData.timeOfBirth !== undefined ? String(updateData.timeOfBirth).trim() : membersToUpdate[memberIndex].timeOfBirth || '',
      placeOfBirth: updateData.placeOfBirth !== undefined ? String(updateData.placeOfBirth).trim() : membersToUpdate[memberIndex].placeOfBirth || '',
      relation: updateData.relation !== undefined ? updateData.relation : membersToUpdate[memberIndex].relation,
      updatedAt: new Date().toISOString()
    };

    saveMembers(membersToUpdate);
    res.json(membersToUpdate[memberIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Data will be stored in: ${dataFilePath}`);
});