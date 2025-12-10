// routes/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const dotenv = require('dotenv');
dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    // sanitize original name
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.\-]/g, '');
    cb(null, `${timestamp}_${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('ONLY_PDF_ALLOWED'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// POST /documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file_required' });

    const { filename, path: filepath, size } = req.file;
    const sql = 'INSERT INTO documents (filename, filepath, filesize) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [filename, filepath, size]);

    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.message === 'ONLY_PDF_ALLOWED') return res.status(400).json({ error: 'only_pdf_allowed' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'file_too_large' });
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /documents
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM documents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// GET /documents/:id (download)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    const doc = rows[0];
    if (!fs.existsSync(doc.filepath)) return res.status(410).json({ error: 'file_missing' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    const filestream = fs.createReadStream(doc.filepath);
    filestream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// DELETE /documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    const doc = rows[0];
    // delete file if exists
    if (fs.existsSync(doc.filepath)) {
      fs.unlinkSync(doc.filepath);
    }
    await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ message: 'deleted', id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
