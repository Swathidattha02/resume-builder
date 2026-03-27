const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const { renderResumeHTML } = require('./resumeTemplates');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const STORAGE_DIR = path.join(ROOT_DIR, 'storage', 'resumes');

function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function generateId() {
  return `r_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function readResumeFile(id) {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  const raw = await fsp.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed;
}

async function writeResumeFile(id, payload) {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function renderPdfFromHtml(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

app.use(express.static(FRONTEND_DIR));
app.get('/', (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Debug / health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// List saved resumes
app.get('/api/resume/list', async (_req, res) => {
  try {
    ensureStorage();
    const files = await fsp.readdir(STORAGE_DIR);
    const results = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const id = f.replace(/\.json$/, '');
      const fullPath = path.join(STORAGE_DIR, f);
      const raw = await fsp.readFile(fullPath, 'utf8');
      const parsed = JSON.parse(raw);
      const name = parsed?.resumeData?.fullName || parsed?.fileName || id;
      results.push({ id, name, updatedAt: parsed.updatedAt || parsed.createdAt });
    }
    // Newest first
    results.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    res.json({ resumes: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

// Get saved resume for editing
app.get('/api/resume/:id', async (req, res) => {
  try {
    ensureStorage();
    const data = await readResumeFile(req.params.id);
    res.json({ id: req.params.id, ...data });
  } catch (_err) {
    res.status(404).json({ error: 'Resume not found' });
  }
});

// Save resume data into local JSON file
app.post('/api/resume/save', async (req, res) => {
  try {
    ensureStorage();
    const { resumeData, templateId, fileName } = req.body || {};
    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({ error: 'Missing resumeData' });
    }
    const id = generateId();
    const now = new Date().toISOString();
    const tid =
      templateId === 'template2' || templateId === 'template3' || templateId === 'template4'
        ? templateId
        : 'template1';
    await writeResumeFile(id, {
      id,
      fileName: fileName || resumeData.fullName || id,
      createdAt: now,
      updatedAt: now,
      templateId: tid,
      resumeData,
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// Update an existing saved resume
app.post('/api/resume/:id/update', async (req, res) => {
  try {
    ensureStorage();
    const { resumeData, templateId } = req.body || {};
    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({ error: 'Missing resumeData' });
    }
    const id = req.params.id;
    const now = new Date().toISOString();
    const existing = await readResumeFile(id).catch(() => null);
    if (!existing) return res.status(404).json({ error: 'Resume not found' });
    const tid =
      templateId === 'template2' || templateId === 'template3' || templateId === 'template4'
        ? templateId
        : existing.templateId || 'template1';
    await writeResumeFile(id, {
      ...existing,
      updatedAt: now,
      templateId: tid,
      resumeData,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// Render HTML preview
app.post('/api/resume/render', async (req, res) => {
  try {
    const { resumeData, templateId } = req.body || {};
    const html = renderResumeHTML({ resumeData, templateId });
    res.json({ html });
  } catch (_err) {
    res.status(500).json({ error: 'Failed to render resume HTML' });
  }
});

// Generate PDF from submitted data (no save)
app.post('/api/resume/download', async (req, res) => {
  try {
    const { resumeData, templateId } = req.body || {};
    const html = renderResumeHTML({ resumeData, templateId });
    const pdfBuffer = await renderPdfFromHtml(html);
    const safeName = (resumeData?.fullName || 'resume').replace(/[^\w\- ]+/g, '').trim() || 'resume';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    res.send(pdfBuffer);
  } catch (_err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate PDF from a saved resume
app.get('/api/resume/:id/download', async (req, res) => {
  try {
    ensureStorage();
    const saved = await readResumeFile(req.params.id);
    const html = renderResumeHTML({
      resumeData: saved?.resumeData,
      templateId: saved?.templateId,
    });
    const pdfBuffer = await renderPdfFromHtml(html);
    const safeName = (saved?.resumeData?.fullName || saved?.fileName || req.params.id)
      .replace(/[^\w\- ]+/g, '')
      .trim() || 'resume';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    res.send(pdfBuffer);
  } catch (_err) {
    res.status(404).json({ error: 'Resume not found' });
  }
});

// Clear all saved resumes (file-based JSON)
app.post('/api/resume/clear', async (_req, res) => {
  try {
    ensureStorage();
    const files = await fsp.readdir(STORAGE_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    await Promise.all(
      jsonFiles.map((f) => fsp.unlink(path.join(STORAGE_DIR, f)).catch(() => {}))
    );
    res.json({ ok: true, deleted: jsonFiles.length });
  } catch (_err) {
    res.status(500).json({ error: 'Failed to clear saved resumes' });
  }
});

const PORT = process.env.PORT || 3000;
ensureStorage();
app.listen(PORT, () => {
  console.log(`Resume Builder running at http://localhost:${PORT}`);
});

