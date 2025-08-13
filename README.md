# know-your-ancestry

An app to manage family members and build your ancestry tree. Add members with optional details (photo, DOB, time/place of birth, address, ZIP, country), and relate members (e.g., parent/child, spouse, sibling). Data is stored locally in `data/members.json` via a small Express server.

## Features

- Add, edit, and delete family members
- Optional photo upload (stored as base64 in JSON)
- Additional fields: phone, address, ZIP/postal code, country
- Birth details: date, time, place
- Relate members with a relation type

## Tech Stack

- React (Create React App)
- Express server for persistence
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd "/Volumes/DATA/My_Learnings/React/my-practice/know-your-ancestry"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Run in Development

This project runs both the client (CRA on port 3000) and the API server (Express on port 5000).

```bash
npm start
```

- Client: `http://localhost:3000`
- API: `http://localhost:5000`

Data will be created at `data/members.json` on first write.

### Build for Production

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

```
know-your-ancestry/
  public/
  src/
  data/
  server.js
  package.json
  README.md
```

## Configuration

- The client proxies API requests to `http://localhost:5000` via `proxy` in `package.json`.
- Server stores data in `data/members.json` relative to the project root.

## License

MIT
