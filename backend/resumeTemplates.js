// resumeTemplates.js - Functions to render resume HTML from data for different templates.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

function joinList(items) {
  if (!Array.isArray(items)) return '';
  return items
    .map((x) => x && String(x).trim())
    .filter(Boolean)
    .map((x) => `<li>${escapeHtml(x)}</li>`)
    .join('');
}

function splitOnce(str, sep) {
  const s = String(str || '');
  const idx = s.indexOf(sep);
  if (idx === -1) return null;
  return [s.slice(0, idx), s.slice(idx + sep.length)];
}

function formatBulletLineBoldLeft(line) {
  const s = String(line || '').trim();
  const parts = splitOnce(s, ' - ');
  if (!parts) return escapeHtml(s);
  const left = parts[0].trim();
  const right = parts[1].trim();
  if (!left || !right) return escapeHtml(s);
  return `<span class="bold">${escapeHtml(left)}</span> - ${escapeHtml(right)}`;
}

function contactLine({ email, phone, address }) {
  const parts = [];
  if (email) parts.push(`<span>${escapeHtml(email)}</span>`);
  if (phone) parts.push(`<span>${escapeHtml(phone)}</span>`);
  if (address) parts.push(`<span>${escapeHtml(address)}</span>`);
  return parts.length ? parts.join(' <span class="dot">•</span> ') : '';
}

function headerBlock(data) {
  const name = escapeHtml(data.fullName || '');
  const contact = contactLine({
    email: data.email,
    phone: data.phone,
    address: data.address,
  });
  return `
    <div class="header">
      <div class="name">${name || 'Your Name'}</div>
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </div>
  `;
}

function renderTemplate1(data) {
  const skills = data.skills || [];
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resume</title>
    <style>
      :root{
        --text:#111827;
        --muted:#6b7280;
        --line:#e5e7eb;
        --accent:#2563eb;
        --bg:#ffffff;
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color:var(--text);
        background:var(--bg);
      }
      .page{
        padding: 40px 44px;
      }
      .header{
        padding-bottom:18px;
        border-bottom:1px solid var(--line);
        margin-bottom:18px;
      }
      .name{
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .contact{
        margin-top:6px;
        color:var(--muted);
        font-size: 13px;
        line-height: 1.4;
      }
      .dot{ margin:0 8px; color:#9ca3af; }
      .section{
        margin-top:16px;
      }
      .section-title{
        font-weight:800;
        font-size: 14px;
        letter-spacing: .02em;
        color: var(--accent);
        margin-bottom:10px;
        text-transform: uppercase;
      }
      .grid{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px 28px;
      }
      .box{
        border:1px solid var(--line);
        border-radius:10px;
        padding: 14px 14px;
      }
      .badge-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      .badge{
        background:#eff6ff;
        color:#1d4ed8;
        border:1px solid #dbeafe;
        padding:6px 10px;
        border-radius:999px;
        font-size: 12px;
        font-weight: 600;
      }
      ul{
        margin:0;
        padding:0;
        list-style:none;
      }
      li{
        margin: 6px 0;
        padding-left: 16px;
        position: relative;
      }
      li:before{
        content:'\\2022';
        position:absolute;
        left:0;
        top:0;
        color:#6b7280;
        font-size: 12px;
        line-height:1.6;
      }
      .tight li{ margin: 4px 0; }
      .muted{ color:var(--muted); }
      @media print{
        .page{ padding: 22px 22px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      ${headerBlock(data)}

      <div class="grid">
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="box">
            <div class="badge-row">
              ${
                skills && skills.length
                  ? skills
                      .filter((x) => x && String(x).trim())
                      .map((x) => `<span class="badge">${escapeHtml(x)}</span>`)
                      .join('')
                  : `<span class="muted">No skills added.</span>`
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Certifications</div>
          <div class="box">
            <ul class="tight">
              ${data.certifications && data.certifications.length ? joinList(data.certifications) : `<li class="muted">None</li>`}
            </ul>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        <div class="box">
          <ul>
            ${data.education && data.education.length ? joinList(data.education) : `<li class="muted">No education added.</li>`}
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        <div class="box">
          <ul>
            ${
              data.experience && data.experience.length
                ? joinList(data.experience)
                : `<li class="muted">No experience added.</li>`
            }
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Projects</div>
        <div class="box">
          <ul>
            ${data.projects && data.projects.length ? joinList(data.projects) : `<li class="muted">No projects added.</li>`}
          </ul>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

function renderTemplate2(data) {
  const skills = data.skills || [];
  const edu = data.education || [];
  const exp = data.experience || [];
  const proj = data.projects || [];
  const cert = data.certifications || [];
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resume</title>
    <style>
      :root{
        --text:#0f172a;
        --muted:#64748b;
        --line:#e2e8f0;
        --accent:#7c3aed;
        --bg:#ffffff;
        --soft:#f5f3ff;
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color:var(--text);
        background:var(--bg);
      }
      .page{ padding: 36px 44px; }
      .top{
        border-bottom:1px solid var(--line);
        padding-bottom: 16px;
        margin-bottom: 18px;
      }
      .name{
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .contact{
        margin-top:6px;
        color:var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }
      .layout{
        display:grid;
        grid-template-columns: 0.38fr 0.62fr;
        gap: 18px 26px;
        align-items:flex-start;
      }
      .side .section-title{ margin-top:14px; }
      .section-title{
        color: var(--accent);
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .05em;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .side-card{
        background: var(--soft);
        border: 1px solid #ede9fe;
        border-radius: 14px;
        padding: 14px 14px;
      }
      .badge-row{ display:flex; flex-wrap:wrap; gap:8px; }
      .badge{
        background:#ffffff;
        border:1px solid #ddd6fe;
        color:#6d28d9;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 650;
      }
      .main .card{
        border:1px solid var(--line);
        border-radius: 14px;
        padding: 16px 16px;
        margin-bottom: 14px;
      }
      .list{
        margin:0;
        padding:0;
        list-style:none;
      }
      .list li{
        margin: 6px 0;
        padding-left: 16px;
        position: relative;
      }
      .list li:before{
        content:'\\2022';
        position:absolute;
        left:0;
        top:0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
      }
      .muted{ color: var(--muted); }
      .timeline{
        position: relative;
        padding-left: 18px;
      }
      .timeline:before{
        content:'';
        position:absolute;
        left: 7px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--line);
      }
      .titem{
        position: relative;
        margin: 12px 0;
        padding-left: 14px;
      }
      .titem:before{
        content:'';
        position:absolute;
        left: -1px;
        top: 6px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid var(--accent);
      }
      @media print{
        .page{ padding: 20px 22px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="top">
        <div class="name">${escapeHtml(data.fullName || 'Your Name')}</div>
        <div class="contact">
          ${
            contactLine({
              email: data.email,
              phone: data.phone,
              address: data.address,
            })
          }
        </div>
      </div>

      <div class="layout">
        <div class="side">
          <div class="side-card">
            <div class="section-title">Skills</div>
            <ul class="list">
              ${
                skills && skills.length ? joinList(skills) : `<li class="muted">No skills added.</li>`
              }
            </ul>
          </div>

          <div class="section-title">Certifications</div>
          <div class="side-card">
            <ul class="list">
              ${
                cert && cert.length
                  ? joinList(cert)
                  : `<li class="muted">None</li>`
              }
            </ul>
          </div>
        </div>

        <div class="main">
          <div class="card">
            <div class="section-title">Education</div>
            <ul class="list">
              ${
                edu && edu.length ? joinList(edu) : `<li class="muted">No education added.</li>`
              }
            </ul>
          </div>

          <div class="card">
            <div class="section-title">Experience</div>
            <ul class="list">
              ${
                exp && exp.length ? joinList(exp) : `<li class="muted">No experience added.</li>`
              }
            </ul>
          </div>

          <div class="card">
            <div class="section-title">Projects</div>
            <ul class="list">
              ${
                proj && proj.length ? joinList(proj) : `<li class="muted">No projects added.</li>`
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

function renderTemplate3(data) {
  const skills = data.skills || [];
  const edu = data.education || [];
  const exp = data.experience || [];
  const proj = data.projects || [];
  const cert = data.certifications || [];

  const contact = contactLine({
    email: data.email,
    phone: data.phone,
    address: data.address,
  });

  const bullets = (arr, emptyText) => {
    if (!arr || !arr.length) return `<li class="muted">${escapeHtml(emptyText)}</li>`;
    return arr
      .filter((x) => x && String(x).trim())
      .map((x) => `<li>${formatBulletLineBoldLeft(x)}</li>`)
      .join('');
  };

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resume</title>
    <style>
      :root{
        --text:#111827;
        --muted:#6b7280;
        --line:#e5e7eb;
        --accent:#2563eb;
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: var(--text);
        background:#fff;
      }
      .wrap{
        max-width: 920px;
        margin: 0 auto;
        padding: 30px 16px 42px;
      }
      .head{
        text-align:center;
        margin-bottom: 18px;
      }
      .name{
        font-size: 34px;
        font-weight: 900;
        letter-spacing: -0.03em;
        margin-bottom: 4px;
      }
      .contact{
        color: var(--muted);
        font-size: 13px;
        line-height: 1.6;
      }
      .dot{ margin: 0 8px; color: #9ca3af; }

      .section{ margin-top: 16px; }
      .section-title{
        font-weight: 900;
        letter-spacing: .06em;
        text-transform: uppercase;
        font-size: 12px;
        color: var(--accent);
        border-bottom: 1px solid var(--line);
        padding-bottom: 6px;
        margin-bottom: 10px;
      }
      .bullets{
        list-style:none;
        margin:0;
        padding:0;
      }
      .bullets li{
        margin: 6px 0;
        padding-left: 16px;
        position: relative;
        line-height: 1.55;
      }
      .bullets li:before{
        content:'\\2022';
        position:absolute;
        left:0;
        top:0;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.6;
      }
      .bullets li.muted{
        color: var(--muted);
      }
      .bullets li.muted:before{
        content:'';
      }
      .bold{ font-weight: 900; }

      @media print{
        .wrap{ padding: 18px 14px 30px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <div class="name">${escapeHtml(data.fullName || 'Your Name')}</div>
        ${contact ? `<div class="contact">${contact}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Skills</div>
        <ul class="bullets">
          ${bullets(skills, 'No skills added.')}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        <ul class="bullets">
          ${bullets(edu, 'No education added.')}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        <ul class="bullets">
          ${bullets(exp, 'No experience added.')}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Projects</div>
        <ul class="bullets">
          ${bullets(proj, 'No projects added.')}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Certifications</div>
        <ul class="bullets">
          ${bullets(cert, 'None')}
        </ul>
      </div>
    </div>
  </body>
  </html>`;
}

function normalizeUrl(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function renderTemplate4(data) {
  const name = escapeHtml(data.fullName || 'Your Name');
  const email = escapeHtml(data.email || '');
  const phone = escapeHtml(data.phone || '');

  const linkedinUrl = normalizeUrl(data.linkedin);
  const githubUrl = normalizeUrl(data.github);

  const linkedinText = linkedinUrl ? escapeHtml(linkedinUrl.replace(/^https?:\/\//i, '')) : '';
  const githubText = githubUrl ? escapeHtml(githubUrl.replace(/^https?:\/\//i, '')) : '';

  const objective = escapeHtml(data.careerObjective || '');

  const edu = Array.isArray(data.education) ? data.education : [];
  const exp = Array.isArray(data.experience) ? data.experience : [];
  const proj = Array.isArray(data.projects) ? data.projects : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const techSkills = Array.isArray(data.technicalSkills) ? data.technicalSkills : [];
  const achievements = Array.isArray(data.achievements) ? data.achievements : [];
  const certs = Array.isArray(data.certifications) ? data.certifications : [];
  const volunteering = Array.isArray(data.volunteering) ? data.volunteering : [];

  // Extract optional right-side date/meta from "(...)" at end of line.
  function splitRightMeta(line) {
    const s = String(line || '').trim();
    const m = s.match(/^(.*)\s+\(([^()]*)\)\s*$/);
    if (!m) return { left: s, right: '' };
    return { left: m[1].trim(), right: m[2].trim() };
  }

  function rowLine(line, { boldLeft = false } = {}) {
    const { left, right } = splitRightMeta(line);
    const leftHtml = boldLeft ? formatBulletLineBoldLeft(left) : escapeHtml(left);
    const rightHtml = right ? `<div class="right">${escapeHtml(right)}</div>` : `<div class="right"></div>`;
    return `
      <div class="rowline">
        <div class="left">${leftHtml}</div>
        ${rightHtml}
      </div>
    `;
  }

  function bulletList(lines, { boldLeft = false } = {}) {
    const arr = (lines || []).map((x) => String(x || '').trim()).filter(Boolean);
    if (!arr.length) return `<li class="muted">-</li>`;
    return arr
      .map((x) => `<li>${boldLeft ? formatBulletLineBoldLeft(x) : escapeHtml(x)}</li>`)
      .join('');
  }

  function section(title, innerHtml) {
    return `
      <div class="section">
        <div class="section-title">${escapeHtml(title)}</div>
        ${innerHtml}
      </div>
    `;
  }

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resume</title>
    <style>
      :root{
        --text:#111827;
        --muted:#4b5563;
        --line:#111827;
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family: "Times New Roman", Times, serif;
        color: var(--text);
        background:#fff;
      }
      .page{
        padding: 22px 34px 34px;
      }
      .name{
        text-align:center;
        font-weight: 900;
        font-size: 22px;
        letter-spacing: .02em;
        margin-top: 2px;
      }
      .contact{
        margin-top: 6px;
        display:flex;
        justify-content:center;
        gap: 14px;
        flex-wrap:wrap;
        font-size: 12.5px;
      }
      .contact a{ color: var(--text); text-decoration: none; }
      .contact a:hover{ text-decoration: underline; }
      .section{ margin-top: 10px; }
      .section-title{
        font-weight: 900;
        font-size: 14px;
        margin: 10px 0 6px;
        padding-bottom: 2px;
        border-bottom: 1px solid var(--line);
      }
      .para{
        font-size: 12.5px;
        line-height: 1.35;
      }
      .rowline{
        display:flex;
        justify-content:space-between;
        gap: 10px;
        font-size: 13px;
        line-height: 1.25;
      }
      .rowline .left{ flex: 1 1 auto; }
      .rowline .right{
        flex: 0 0 auto;
        min-width: 140px;
        text-align:right;
        white-space:nowrap;
        font-size: 13px;
      }
      ul.bullets{
        margin: 0;
        padding-left: 18px;
      }
      ul.bullets li{
        margin: 2px 0;
        font-size: 12.5px;
        line-height: 1.25;
      }
      .muted{ color: var(--muted); }
      .bold{ font-weight: 900; }
      @media print{
        .page{ padding: 18px 22px 26px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="name">${name}</div>
      <div class="contact">
        ${phone ? `<span>${phone}</span>` : ''}
        ${email ? `<span>${email}</span>` : ''}
        ${linkedinUrl ? `<a href="${escapeAttr(linkedinUrl)}">${linkedinText}</a>` : ''}
        ${githubUrl ? `<a href="${escapeAttr(githubUrl)}">${githubText}</a>` : ''}
      </div>

      ${
        objective
          ? section('Career Objective', `<div class="para">${objective}</div>`)
          : ''
      }

      ${section(
        'Education',
        edu.length
          ? edu.map((x) => rowLine(x, { boldLeft: true })).join('')
          : `<div class="para muted">-</div>`
      )}

      ${section(
        'Experience',
        exp.length
          ? `<ul class="bullets">${bulletList(exp, { boldLeft: true })}</ul>`
          : `<div class="para muted">-</div>`
      )}

      ${section(
        'Projects',
        proj.length
          ? `<ul class="bullets">${bulletList(proj, { boldLeft: true })}</ul>`
          : `<div class="para muted">-</div>`
      )}

      ${section(
        'Technical Skills',
        techSkills.length
          ? `<ul class="bullets">${bulletList(techSkills, { boldLeft: true })}</ul>`
          : skills.length
            ? `<ul class="bullets">${bulletList(skills, { boldLeft: false })}</ul>`
            : `<div class="para muted">-</div>`
      )}

      ${section(
        'Achievements',
        achievements.length
          ? `<ul class="bullets">${bulletList(achievements)}</ul>`
          : `<div class="para muted">-</div>`
      )}

      ${section(
        'Certifications & Volunteering',
        (certs.length || volunteering.length)
          ? `<ul class="bullets">${bulletList([...certs, ...volunteering], { boldLeft: true })}</ul>`
          : `<div class="para muted">-</div>`
      )}
    </div>
  </body>
  </html>`;
}

function renderResumeHTML({ resumeData, templateId }) {
  const safeTemplateId =
    templateId === 'template2'
      ? 'template2'
      : templateId === 'template3'
        ? 'template3'
        : templateId === 'template4'
          ? 'template4'
          : 'template1';
  const data = resumeData || {};
  data.skills = Array.isArray(data.skills) ? data.skills : [];
  data.education = Array.isArray(data.education) ? data.education : [];
  data.experience = Array.isArray(data.experience) ? data.experience : [];
  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.certifications = Array.isArray(data.certifications) ? data.certifications : [];
  data.technicalSkills = Array.isArray(data.technicalSkills) ? data.technicalSkills : [];
  data.achievements = Array.isArray(data.achievements) ? data.achievements : [];
  data.volunteering = Array.isArray(data.volunteering) ? data.volunteering : [];

  if (safeTemplateId === 'template2') return renderTemplate2(data);
  if (safeTemplateId === 'template3') return renderTemplate3(data);
  if (safeTemplateId === 'template4') return renderTemplate4(data);
  return renderTemplate1(data);
}

module.exports = { renderResumeHTML };

