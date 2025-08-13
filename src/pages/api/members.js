// Next.js API route to manage family members persisted in data/members.json
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataFilePath = path.join(process.cwd(), 'know-your-ancestry', 'data', 'members.json');

function ensureDataDir() {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeMember(raw) {
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
}

function loadMembers() {
  ensureDataDir();
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      const parsed = JSON.parse(content || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeMember) : [];
    }
    return [];
  } catch (err) {
    console.error('Error reading members.json:', err);
    return [];
  }
}

function saveMembers(members) {
  ensureDataDir();
  fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const members = loadMembers();
      return res.status(200).json(members);
    } catch (e) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, phone, address, zipPostalCode, country, photo, relation, dateOfBirth, timeOfBirth, placeOfBirth } = req.body || {};

      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const newMember = {
        id: uuidv4(),
        name: String(name).trim(),
        phone: phone ? String(phone).trim() : '',
        address: address ? String(address).trim() : '',
        zipPostalCode: zipPostalCode ? String(zipPostalCode).trim() : '',
        country: country ? String(country).trim() : '',
        photo: photo || '',
        dateOfBirth: dateOfBirth ? String(dateOfBirth).trim() : '',
        timeOfBirth: timeOfBirth ? String(timeOfBirth).trim() : '',
        placeOfBirth: placeOfBirth ? String(placeOfBirth).trim() : '',
        createdAt: new Date().toISOString(),
      };

      if (relation && relation.relatedMemberId && relation.type) {
        newMember.relation = {
          relatedMemberId: String(relation.relatedMemberId),
          type: String(relation.type),
        };
      }

      const members = loadMembers();
      members.push(newMember);
      saveMembers(members);
      return res.status(201).json(newMember);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to add member' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const members = loadMembers();
      const next = members.filter((m) => m.id !== id);
      if (next.length === members.length) {
        return res.status(404).json({ error: 'Member not found' });
      }
      saveMembers(next);
      return res.status(200).json({ message: 'Member deleted successfully' });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete member' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const update = req.body || {};
      const members = loadMembers();
      const idx = members.findIndex((m) => m.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Member not found' });
      }
      const current = members[idx];
      members[idx] = {
        ...current,
        name: update.name ? String(update.name).trim() : current.name,
        phone: update.phone ? String(update.phone).trim() : current.phone,
        address: update.address !== undefined ? String(update.address).trim() : current.address || '',
        zipPostalCode: update.zipPostalCode !== undefined ? String(update.zipPostalCode).trim() : current.zipPostalCode || '',
        country: update.country !== undefined ? String(update.country).trim() : current.country || '',
        photo: update.photo !== undefined ? update.photo : current.photo || '',
        dateOfBirth: update.dateOfBirth !== undefined ? String(update.dateOfBirth).trim() : current.dateOfBirth || '',
        timeOfBirth: update.timeOfBirth !== undefined ? String(update.timeOfBirth).trim() : current.timeOfBirth || '',
        placeOfBirth: update.placeOfBirth !== undefined ? String(update.placeOfBirth).trim() : current.placeOfBirth || '',
        relation: update.relation !== undefined ? update.relation : current.relation,
        updatedAt: new Date().toISOString(),
      };
      saveMembers(members);
      return res.status(200).json(members[idx]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update member' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};


