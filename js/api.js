// Single place to configure the backend address.
const API_BASE_URL = "http://localhost:8000/api";

// fetch wrapper: sends the session cookie, throws Error(message) on failure, redirects to login on 401 for protected pages.
async function api(path, opts = {}) {
  const r = await fetch(API_BASE_URL + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && document.body.dataset.protected) {
      location.href = "login.html";
    }
    throw new Error(data.message || "Request failed (" + r.status + ")");
  }
  return data;
}

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Toast notification system
function showToast(message, type = "ok") {
  // Remove any existing toast
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast toast-" + type;
  toast.innerHTML = `
    <div class="toast-icon">
      ${type === "ok"
        ? '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
        : '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
      }
    </div>
    <span>${esc(message)}</span>
  `;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("toast-show"));

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
