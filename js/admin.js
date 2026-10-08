// ---- ADMIN DASHBOARD JS ----

async function init() {
  const me = await api("/auth/me");
  document.getElementById("welcome").textContent = "Welcome, " + me.name;
  if (me.role !== "ADMIN") {
    location.href = "dashboard.html";
    return;
  }
  loadJobs();
  loadApplications();
  loadUsers();
}

// ---- TABS ----
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
  });
});

// ---- VACANCIES ----
async function loadJobs() {
  const jobs = await api("/admin/jobs");
  const list = document.getElementById("jobsList");

  if (jobs.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>No vacancies yet</h3><p>Click "Sync from API" or "+ Add Job" to get started.</p></div>`;
    return;
  }

  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Company</th>
          <th>Location</th>
          <th>Required Skills</th>
          <th>Exp</th>
          <th>Source</th>
          <th style="text-align:right;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${jobs.map(j => `
          <tr>
            <td><strong>${esc(j.title)}</strong></td>
            <td>${esc(j.company)}</td>
            <td>${esc(j.location || '-')}</td>
            <td><span class="cell-truncate">${esc(j.requiredSkills || '-')}</span></td>
            <td>${j.requiredExperience}+</td>
            <td><span class="badge">${esc(j.source || 'MANUAL')}</span></td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn btn-outline btn-xs edit-job" data-id="${j.id}">Edit</button>
              <button class="btn btn-danger btn-xs delete-job" data-id="${j.id}">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ---- APPLICATIONS (DETAILED VIEW) ----
async function loadApplications() {
  const list = document.getElementById("appsList");
  let apps;
  try {
    apps = await api("/admin/applications/detailed");
  } catch (_) {
    apps = [];
  }

  if (apps.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>No applications yet</h3><p>Applications will appear here when users apply to jobs.</p></div>`;
    return;
  }

  list.innerHTML = apps.map(a => `
    <div class="app-detail-card">
      <div class="app-detail-header">
        <div>
          <div style="font-weight:600; font-size:1rem;">${esc(a.applicantName)}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${esc(a.applicantEmail)}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge match">${esc(a.status)}</span>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '-'}</div>
        </div>
      </div>

      <div class="app-detail-body">
        <!-- Applicant Profile -->
        <div class="app-detail-section">
          <div class="app-detail-label">Applicant Profile</div>
          <div class="app-detail-grid">
            <div><span class="lbl">Target Role:</span> ${esc(a.applicantJobTitle || '-')}</div>
            <div><span class="lbl">Experience:</span> ${a.applicantExperience || 0} years</div>
            <div><span class="lbl">Qualification:</span> ${esc(a.applicantQualification || '-')}</div>
            <div><span class="lbl">Location:</span> ${esc(a.applicantLocation || '-')}</div>
          </div>
          <div style="margin-top:0.5rem;">
            <span class="lbl">Skills:</span>
            ${(a.applicantSkills || []).map(s => `<span class="badge">${esc(s)}</span>`).join("") || '<span style="color:var(--text-muted)">None listed</span>'}
          </div>
        </div>

        <!-- Applied Job -->
        <div class="app-detail-section">
          <div class="app-detail-label">Applied For</div>
          <div class="app-detail-grid">
            <div><span class="lbl">Job:</span> <strong>${esc(a.jobTitle)}</strong></div>
            <div><span class="lbl">Company:</span> ${esc(a.jobCompany || '-')}</div>
            <div><span class="lbl">Location:</span> ${esc(a.jobLocation || '-')}</div>
            <div><span class="lbl">Min. Exp:</span> ${a.jobExperience || 0}+ years</div>
          </div>
          <div style="margin-top:0.5rem;">
            <span class="lbl">Required Skills:</span>
            <span style="font-size:0.8rem;">${esc(a.jobSkills || 'None specified')}</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// ---- USERS ----
async function loadUsers() {
  const users = await api("/admin/users");
  const list = document.getElementById("usersList");

  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td><strong>${esc(u.name)}</strong></td>
            <td>${esc(u.email)}</td>
            <td><span class="badge ${u.role === 'ADMIN' ? 'match' : ''}">${esc(u.role)}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ---- JOB MODAL ----
const modal = document.getElementById("jobModal");
const form = document.getElementById("jobForm");

function openModal(job) {
  document.getElementById("modalTitle").textContent = job ? "Edit Job" : "Add Job";
  document.getElementById("jobFormBtn").textContent = job ? "Update Job" : "Save Job";
  form.reset();
  if (job) {
    document.getElementById("jId").value = job.id;
    document.getElementById("jTitle").value = job.title || "";
    document.getElementById("jCompany").value = job.company || "";
    document.getElementById("jLocation").value = job.location || "";
    document.getElementById("jSalary").value = job.salary || "";
    document.getElementById("jSkills").value = job.requiredSkills || "";
    document.getElementById("jExp").value = job.requiredExperience || 0;
    document.getElementById("jType").value = job.employmentType || "";
    document.getElementById("jUrl").value = job.applicationUrl || "";
    document.getElementById("jDesc").value = job.description || "";
  } else {
    document.getElementById("jId").value = "";
  }
  modal.style.display = "flex";
}

function closeModal() { modal.style.display = "none"; }
document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = document.getElementById("jobFormBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  const body = {
    title: document.getElementById("jTitle").value,
    company: document.getElementById("jCompany").value,
    location: document.getElementById("jLocation").value,
    salary: document.getElementById("jSalary").value,
    requiredSkills: document.getElementById("jSkills").value,
    requiredExperience: Number(document.getElementById("jExp").value),
    employmentType: document.getElementById("jType").value,
    applicationUrl: document.getElementById("jUrl").value,
    description: document.getElementById("jDesc").value
  };

  const id = document.getElementById("jId").value;
  try {
    if (id) {
      await api("/admin/jobs/" + id, { method: "PUT", body: JSON.stringify(body) });
      showToast("Job updated successfully!");
    } else {
      await api("/admin/jobs", { method: "POST", body: JSON.stringify(body) });
      showToast("Job added successfully!");
    }
    closeModal();
    loadJobs();
  } catch (err) {
    showToast(err.message, "err");
  }
  btn.disabled = false;
  btn.textContent = id ? "Update Job" : "Save Job";
});

// ---- EVENT DELEGATION ----
document.addEventListener("click", async e => {
  const logoutBtn = e.target.closest("#logout");
  const syncBtn = e.target.closest("#syncBtn");
  const addBtn = e.target.closest("#addJobBtn");
  const editBtn = e.target.closest(".edit-job");
  const deleteBtn = e.target.closest(".delete-job");

  if (logoutBtn) {
    try { await api("/auth/logout", { method: "POST" }); } catch (_) {}
    location.href = "index.html";
    return;
  }

  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    try {
      const r = await api("/admin/jobs/sync", { method: "POST" });
      showToast(`Synced: ${r.added} added, ${r.updated} updated`);
      loadJobs();
    } catch (err) { showToast(err.message, "err"); }
    syncBtn.disabled = false;
    syncBtn.textContent = "Sync from API";
    return;
  }

  if (addBtn) { openModal(null); return; }

  if (editBtn) {
    try {
      const jobs = await api("/admin/jobs");
      const job = jobs.find(j => j.id === Number(editBtn.dataset.id));
      if (job) openModal(job);
    } catch (err) { showToast(err.message, "err"); }
    return;
  }

  if (deleteBtn) {
    if (!confirm("Delete this job? All associated applications will also be removed.")) return;
    try {
      await api("/admin/jobs/" + deleteBtn.dataset.id, { method: "DELETE" });
      showToast("Job deleted");
      loadJobs();
      loadApplications();
    } catch (err) { showToast(err.message, "err"); }
    return;
  }
});

init().catch(err => showToast(err.message, "err"));
