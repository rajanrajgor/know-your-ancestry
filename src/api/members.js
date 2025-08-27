// api/members.js
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // ❌ disable default body parser for file uploads
  },
};

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "members.json");
const photosDir = path.join(dataDir, "photos");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
}

function loadMembers() {
  ensureDirs();
  if (fs.existsSync(dataFilePath)) {
    return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  }
  return [];
}

function saveMembers(members) {
  ensureDirs();
  fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2));
}

export default async function handler(req, res) {
  ensureDirs();

  if (req.method === "GET") {
    return res.status(200).json(loadMembers());
  }

  if (req.method === "POST") {
    try {
      const form = formidable({ multiples: false, uploadDir: photosDir, keepExtensions: true });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Upload error:", err);
          return res.status(500).json({ error: "Failed to process upload" });
        }

        const members = loadMembers();

        const newMember = {
          id: uuidv4(),
          name: fields.name || "",
          phone: fields.phone || "",
          address: fields.address || "",
          zipPostalCode: fields.zipPostalCode || "",
          country: fields.country || "",
          dateOfBirth: fields.dateOfBirth || "",
          timeOfBirth: fields.timeOfBirth || "",
          placeOfBirth: fields.placeOfBirth || "",
          createdAt: new Date().toISOString(),
        };

        // Save photo if uploaded
        if (files.photo) {
          const fileExt = path.extname(files.photo.originalFilename || ".webp");
          const fileName = `${newMember.id}${fileExt}`;
          const destPath = path.join(photosDir, fileName);
          fs.renameSync(files.photo.filepath, destPath);
          newMember.photo = `data/photos/${fileName}`; // relative path stored
        }

        if (fields.relation) {
          try {
            const relation = JSON.parse(fields.relation);
            if (relation.relatedMemberId && relation.type) {
              newMember.relation = relation;
            }
          } catch (_) {}
        }

        members.push(newMember);
        saveMembers(members);

        return res.status(201).json(newMember);
      });
    } catch (e) {
      console.error("Error in POST:", e);
      return res.status(500).json({ error: "Failed to add member" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
