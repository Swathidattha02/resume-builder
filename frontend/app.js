const API_BASE = 'https://your-backend.onrender.com'; // Replace with your actual Render service URL

const draftKey = 'resume_builder_draft_v1';
const lastSavedKey = 'resume_builder_last_saved_id_v1';

const els = {
  fullName: document.getElementById('fullName'),
  linkedin: document.getElementById('linkedin'),
  github: document.getElementById('github'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  address: document.getElementById('address'),
  skillsText: document.getElementById('skillsText'),
  careerObjective: document.getElementById('careerObjective'),
  educationText: document.getElementById('educationText'),
  experienceText: document.getElementById('experienceText'),
  projectsText: document.getElementById('projectsText'),
  technicalSkillsText: document.getElementById('technicalSkillsText'),
  achievementsText: document.getElementById('achievementsText'),
  certificationsText: document.getElementById('certificationsText'),
  volunteeringText: document.getElementById('volunteeringText'),
  templateSelect: document.getElementById('templateSelect'),
  previewBtn: document.getElementById('previewBtn'),
  saveBtn: document.getElementById('saveBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  newBtn: document.getElementById('newBtn'),
  previewFrame: document.getElementById('previewFrame'),
  statusBox: document.getElementById('statusBox'),
  savedList: document.getElementById('savedList'),
  refreshSavedBtn: document.getElementById('refreshSavedBtn'),
  clearSavedBtn: document.getElementById('clearSavedBtn'),
};

let lastSavedId = localStorage.getItem(lastSavedKey);

function setStatus(text, kind) {
  els.statusBox.textContent = text || '';
  els.statusBox.className = 'status' + (kind ? ` ${kind}` : '');
}

function splitSkills(text) {
  return (text || '')
    .split(/[,\n\r]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function splitLines(text) {
  return (text || '')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function splitSpacedDashParts(line) {
  // Splits only when dash has spaces around it: "A - B - C"
  // This avoids breaking names that contain a normal hyphen without spaces.
  return String(line)
    .split(/\s+-\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function formatExperienceLine(line) {
  const parts = splitSpacedDashParts(line);
  if (parts.length >= 3) {
    const title = parts[0];
    const company = parts[1];
    const meta = parts.slice(2).join(' - ');
    return `${title} - ${company} (${meta})`;
  }
  if (parts.length === 2) return `${parts[0]} - ${parts[1]}`;
  return line.trim();
}

function formatEducationLine(line) {
  const parts = splitSpacedDashParts(line);
  if (parts.length >= 3) {
    const degree = parts[0];
    const school = parts[1];
    const meta = parts.slice(2).join(' - ');
    return `${degree} - ${school} (${meta})`;
  }
  if (parts.length === 2) return `${parts[0]} - ${parts[1]}`;
  return line.trim();
}

function formatProjectLine(line) {
  const parts = splitSpacedDashParts(line);
  if (parts.length >= 2) {
    const name = parts[0];
    const desc = parts.slice(1).join(' - ');
    return `${name} - ${desc}`;
  }
  return line.trim();
}

function formatCertificationLine(line) {
  const parts = splitSpacedDashParts(line);
  if (parts.length >= 3) {
    const cert = parts[0];
    const issuer = parts[1];
    const meta = parts.slice(2).join(' - ');
    return `${cert} - ${issuer} (${meta})`;
  }
  if (parts.length === 2) return `${parts[0]} - ${parts[1]}`;
  return line.trim();
}

function splitLinesWithFormatter(text, formatter) {
  return splitLines(text).map((x) => formatter(String(x)));
}

function getResumeDataFromForm() {
  return {
    fullName: els.fullName.value.trim(),
    linkedin: els.linkedin.value.trim(),
    github: els.github.value.trim(),
    email: els.email.value.trim(),
    phone: els.phone.value.trim(),
    address: els.address.value.trim(),
    skills: splitSkills(els.skillsText.value),
    careerObjective: els.careerObjective.value.trim(),
    education: splitLinesWithFormatter(els.educationText.value, formatEducationLine),
    experience: splitLinesWithFormatter(els.experienceText.value, formatExperienceLine),
    projects: splitLinesWithFormatter(els.projectsText.value, formatProjectLine),
    technicalSkills: splitLines(els.technicalSkillsText.value),
    achievements: splitLines(els.achievementsText.value),
    certifications: splitLinesWithFormatter(els.certificationsText.value, formatCertificationLine),
    volunteering: splitLines(els.volunteeringText.value),
  };
}

function setFormFromResume(resumeData) {
  els.fullName.value = resumeData.fullName || '';
  els.linkedin.value = resumeData.linkedin || '';
  els.github.value = resumeData.github || '';
  els.email.value = resumeData.email || '';
  els.phone.value = resumeData.phone || '';
  els.address.value = resumeData.address || '';
  els.skillsText.value = (resumeData.skills || []).join(', ');
  els.careerObjective.value = resumeData.careerObjective || '';
  els.educationText.value = (resumeData.education || []).join('\n');
  els.experienceText.value = (resumeData.experience || []).join('\n');
  els.projectsText.value = (resumeData.projects || []).join('\n');
  els.technicalSkillsText.value = (resumeData.technicalSkills || []).join('\n');
  els.achievementsText.value = (resumeData.achievements || []).join('\n');
  els.certificationsText.value = (resumeData.certifications || []).join('\n');
  els.volunteeringText.value = (resumeData.volunteering || []).join('\n');
}

function getTemplateId() {
  const v = els.templateSelect.value;
  if (v === 'template2' || v === 'template3' || v === 'template4') return v;
  return 'template1';
}

function setDraft() {
  const payload = {
    templateId: getTemplateId(),
    resumeData: getResumeDataFromForm(),
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(draftKey, JSON.stringify(payload));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.resumeData) return;
    if (parsed.templateId) els.templateSelect.value = parsed.templateId;
    setFormFromResume(parsed.resumeData);
  } catch (_e) {
    // ignore
  }
}

async function apiPost(url, body) {
  const res = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiGet(url) {
  const res = await fetch(API_BASE + url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function validateForRequired() {
  const d = getResumeDataFromForm();
  if (!d.fullName) return 'Full Name is required.';
  if (!d.email) return 'Email is required.';
  if (!d.phone) return 'Phone Number is required.';
  if (!d.address) return 'Address is required.';
  // very light email check for beginners
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return 'Please enter a valid email address.';
  return '';
}

async function preview() {
  const templateId = getTemplateId();
  const resumeData = getResumeDataFromForm();
  const { html } = await apiPost('/api/resume/render', { resumeData, templateId });
  els.previewFrame.srcdoc = html;
}

async function downloadCurrent() {
  const templateId = getTemplateId();
  const resumeData = getResumeDataFromForm();
  const errMsg = validateForRequired();
  if (errMsg) {
    setStatus(errMsg, 'err');
    return;
  }

  setStatus('Generating PDF...', '');
  const res = await fetch(`${API_BASE}/api/resume/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, templateId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    setStatus(err.error || 'Failed to generate PDF.', 'err');
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (resumeData.fullName || 'resume').replace(/[^\w\- ]+/g, '').trim() || 'resume';
  a.href = url;
  a.download = `${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus('PDF downloaded.', 'ok');
}

async function saveOrUpdate() {
  const templateId = getTemplateId();
  const resumeData = getResumeDataFromForm();
  const errMsg = validateForRequired();
  if (errMsg) {
    setStatus(errMsg, 'err');
    return;
  }

  if (lastSavedId) {
    setStatus('Updating saved resume...', '');
    await apiPost(`/api/resume/${encodeURIComponent(lastSavedId)}/update`, { resumeData, templateId });
    setStatus('Resume updated (saved to file).', 'ok');
  } else {
    setStatus('Saving resume...', '');
    const { id } = await apiPost('/api/resume/save', { resumeData, templateId, fileName: resumeData.fullName });
    lastSavedId = id;
    localStorage.setItem(lastSavedKey, lastSavedId);
    setStatus('Resume saved (saved to file).', 'ok');
  }

  await refreshSavedList();
}

function clearForm() {
  els.fullName.value = '';
  els.linkedin.value = '';
  els.github.value = '';
  els.email.value = '';
  els.phone.value = '';
  els.address.value = '';
  els.skillsText.value = '';
  els.careerObjective.value = '';
  els.educationText.value = '';
  els.experienceText.value = '';
  els.projectsText.value = '';
  els.technicalSkillsText.value = '';
  els.achievementsText.value = '';
  els.certificationsText.value = '';
  els.volunteeringText.value = '';
  els.templateSelect.value = 'template4';
  lastSavedId = null;
  localStorage.removeItem(lastSavedKey);
  setStatus('', '');
  els.previewFrame.srcdoc = '';
  setDraft();
}

function toListItem({ id, name }) {
  const item = document.createElement('div');
  item.className = 'saved-item';

  const left = document.createElement('div');
  left.className = 'saved-left';
  const title = document.createElement('div');
  title.className = 'saved-name';
  title.textContent = name || id;
  const meta = document.createElement('div');
  meta.className = 'saved-meta';
  meta.textContent = `ID: ${id}`;
  left.appendChild(title);
  left.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'mini-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', async () => {
    const saved = await apiGet(`/api/resume/${encodeURIComponent(id)}`);
    lastSavedId = id;
    localStorage.setItem(lastSavedKey, lastSavedId);
    els.templateSelect.value =
      saved.templateId === 'template2' || saved.templateId === 'template3' || saved.templateId === 'template4'
        ? saved.templateId
        : 'template1';
    setFormFromResume(saved.resumeData || {});
    setStatus('Loaded saved resume. You can update now.', 'ok');
    await preview();
  });

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.textContent = 'Download';
  downloadBtn.addEventListener('click', async () => {
    window.location.href = `${API_BASE}/api/resume/${encodeURIComponent(id)}/download`;
  });

  actions.appendChild(editBtn);
  actions.appendChild(downloadBtn);
  item.appendChild(left);
  item.appendChild(actions);
  return item;
}

async function refreshSavedList() {
  try {
    const { resumes } = await apiGet('/api/resume/list');
    els.savedList.innerHTML = '';
    if (!resumes || !resumes.length) {
      const empty = document.createElement('div');
      empty.className = 'saved-item';
      empty.textContent = 'No saved resumes yet.';
      els.savedList.appendChild(empty);
      return;
    }

    for (const r of resumes) {
      els.savedList.appendChild(toListItem(r));
    }
  } catch (e) {
    els.savedList.innerHTML = '';
    setStatus(e.message || 'Failed to load saved resumes.', 'err');
  }
}

async function init() {
  // Draft auto-load
  loadDraft();

  // Reflect saved/edit state in the Save button label.
  els.saveBtn.textContent = lastSavedId ? 'Update Resume' : 'Save Resume';

  // Auto-draft save (debounced)
  let draftTimer = null;
  const inputsToWatch = [
    els.fullName,
    els.linkedin,
    els.github,
    els.email,
    els.phone,
    els.address,
    els.skillsText,
    els.careerObjective,
    els.educationText,
    els.experienceText,
    els.projectsText,
    els.technicalSkillsText,
    els.achievementsText,
    els.certificationsText,
    els.volunteeringText,
    els.templateSelect,
  ];
  for (const el of inputsToWatch) {
    el.addEventListener('input', () => {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        setDraft();
        els.saveBtn.textContent = lastSavedId ? 'Update Resume' : 'Save Resume';
      }, 250);
    });
  }

  els.previewBtn.addEventListener('click', async () => {
    try {
      setStatus('Rendering preview...', '');
      await preview();
      setStatus('Preview updated.', 'ok');
    } catch (e) {
      setStatus(e.message || 'Preview failed.', 'err');
    }
  });

  els.saveBtn.addEventListener('click', async () => {
    try {
      await saveOrUpdate();
      els.saveBtn.textContent = lastSavedId ? 'Update Resume' : 'Save Resume';
    } catch (e) {
      setStatus(e.message || 'Save failed.', 'err');
    }
  });

  els.downloadBtn.addEventListener('click', async () => {
    try {
      await downloadCurrent();
    } catch (e) {
      setStatus(e.message || 'Download failed.', 'err');
    }
  });

  els.newBtn.addEventListener('click', () => clearForm());

  els.refreshSavedBtn.addEventListener('click', async () => {
    await refreshSavedList();
  });

  els.clearSavedBtn.disabled = false;
  els.clearSavedBtn.title = 'Deletes all server-saved JSON files.';
  els.clearSavedBtn.addEventListener('click', async () => {
    const ok = window.confirm('Clear all saved resumes on the server (JSON files)?');
    if (!ok) return;
    try {
      setStatus('Clearing saved resumes...', '');
      await apiPost('/api/resume/clear', {});
      lastSavedId = null;
      localStorage.removeItem(lastSavedKey);
      els.saveBtn.textContent = 'Save Resume';
      els.previewFrame.srcdoc = '';
      setStatus('All saved resumes cleared.', 'ok');
      await refreshSavedList();
    } catch (e) {
      setStatus(e.message || 'Failed to clear saved resumes.', 'err');
    }
  });

  await refreshSavedList();
}

init();

