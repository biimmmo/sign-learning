const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static if you want (optional)
// app.use('/', express.static(path.join(__dirname, '../frontend')));

const LESSONS_PATH = path.join(__dirname, 'data', 'lessons.json');
const PROGRESS_PATH = path.join(__dirname, 'progress.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return null; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// GET lessons
app.get('/api/lessons', (req, res) => {
  const data = readJson(LESSONS_PATH) || [];
  res.json(data);
});

// GET all progress
app.get('/api/progress', (req, res) => {
  const data = readJson(PROGRESS_PATH) || [];
  res.json(data);
});


// POST progress (simple append/update by user_id+lesson_slug)
app.post('/api/progress', (req, res) => {
  const { user_id, lesson_slug, completed, score } = req.body;
  if(!user_id || !lesson_slug) return res.status(400).json({ error: 'user_id and lesson_slug required' });

  let arr = readJson(PROGRESS_PATH);
  if(!arr) arr = [];

  const idx = arr.findIndex(item => item.user_id === user_id && item.lesson_slug === lesson_slug);
  const payload = {
    user_id,
    lesson_slug,
    completed: !!completed,
    score: typeof score === 'number' ? score : null,
    updated_at: new Date().toISOString()
  };

  if(idx >= 0) arr[idx] = Object.assign({}, arr[idx], payload);
  else arr.push(payload);

  writeJson(PROGRESS_PATH, arr);
  res.json({ ok: true, data: payload });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
