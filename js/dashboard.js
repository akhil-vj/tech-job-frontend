const safeUrl = u => /^https?:\/\//.test(u || "") ? u : "#";

async function load() {
  const me = await api("/auth/me");
  const p = await api("/profile");
  document.getElementById("welcome").textContent = "Welcome, " + me.name;

  // If admin accidentally lands here, redirect
  if (me.role === "ADMIN") {
    location.href = "admin.html";
    return;
  }

  // Render profile sidebar
  document.getElementById("profile").innerHTML = `
    <div style="font-weight:600; font-size:1.05rem; margin-bottom:1rem;">${esc(p.jobTitle)}</div>
    <ul class="profile-stats">
      <li><span class="lbl">Experience</span> <span class="val">${p.experienceYears} yrs</span></li>
      <li><span class="lbl">Qualification</span> <span class="val">${esc(p.qualification || '-')}</span></li>
      <li><span class="lbl">Location</span> <span class="val">${esc(p.preferredLocation || 'Any')}</span></li>
      <li><span class="lbl">Remote</span> <span class="val">${p.remotePreference ? 'Yes' : 'No'}</span></li>
    </ul>
    <div style="margin-top:1.25rem;">
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">Your Skills</div>
      <div>${p.skills.map(s => `<span class="badge">${esc(s)}</span>`).join("")}</div>
    </div>
  `;

  // Also load the user's existing applications to mark "Already Applied"
  let appliedJobIds = new Set();
  try {
    const myApps = await api("/applications");
    myApps.forEach(a => appliedJobIds.add(a.jobId));
  } catch (_) {}

  // Load recommended jobs (filtered by qualification on the backend)
  const recs = await api("/jobs/recommended");

  if (recs.length === 0) {
    document.getElementById("jobs").innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        <h3>No matching jobs for your qualifications</h3>
        <p>Jobs matching your skills will appear here. Ask an admin to sync vacancies or update your profile.</p>
      </div>
    `;
    return;
  }

  document.getElementById("jobs").innerHTML = recs.map(r => {
    const alreadyApplied = appliedJobIds.has(r.jobId);
    return `
    <div class="job-card">
      <div class="job-header">
        <div>
          <div class="job-title">${esc(r.title)}</div>
          <div class="job-company">${esc(r.company)} · ${esc(r.location)}</div>
        </div>
        <span class="badge match">${r.matchScore}% match</span>
      </div>
      <div class="job-match-reason">
        ${r.reasons.map(x => {
          const isOk = x.startsWith("✓");
          const txt = x.replace(/^[✓⚠]\s*/, "");
          return `<div class="reason ${isOk ? 'reason-ok' : 'reason-warn'}">${esc(txt)}</div>`;
        }).join("")}
      </div>
      <div style="margin-top:1rem; display:flex; gap:0.5rem; align-items:center;">
        ${alreadyApplied
          ? `<button class="btn btn-applied btn-sm" disabled>Applied ✓</button>`
          : `<button class="btn btn-sm apply-btn" data-id="${r.jobId}">Apply</button>`
        }
        <a class="btn btn-outline btn-sm" href="${esc(safeUrl(r.applicationUrl))}" target="_blank" rel="noopener">View Job</a>
      </div>
    </div>
  `}).join("");
}

// Event delegation — use closest() for robust click handling
document.addEventListener("click", async e => {
  const applyBtn = e.target.closest(".apply-btn");
  const logoutBtn = e.target.closest("#logout");

  if (logoutBtn) {
    try { await api("/auth/logout", { method: "POST" }); } catch (_) { /* ignore */ }
    location.href = "index.html";
    return;
  }

  if (applyBtn && applyBtn.dataset.id) {
    applyBtn.disabled = true;
    applyBtn.textContent = "Applying...";
    try {
      await api("/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: Number(applyBtn.dataset.id) })
      });
      applyBtn.textContent = "Applied ✓";
      applyBtn.classList.add("btn-applied");

      // Show success popup
      showSuccessPopup();
    } catch (err) {
      showToast(err.message, "err");
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply";
    }
  }
});

// Full-screen success popup matching the wireframe
function showSuccessPopup() {
  const existing = document.getElementById("successOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "successOverlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="success-popup">
      <svg width="64" height="64" fill="none" stroke="#059669" viewBox="0 0 24 24" style="margin-bottom:1.5rem;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h2 style="margin-bottom:0.5rem; font-size:1.5rem;">Application Successful!</h2>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">Your application has been submitted. The recruiter will review your profile and get back to you.</p>
      <button class="btn" id="closeSuccess">Continue Browsing</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("closeSuccess").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

load().catch(err => {
  document.getElementById("jobs").innerHTML = `<p class="err">${esc(err.message)}</p>`;
});
