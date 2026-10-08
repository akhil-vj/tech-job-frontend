// Handles both login.html and register.html
const msg = document.getElementById("msg");
const show = (t, ok) => {
  msg.textContent = t;
  msg.className = ok ? "ok" : "err";
  msg.style.display = "block";
};

const reg = document.getElementById("regForm");
const log = document.getElementById("loginForm");

// ---- REGISTER ----
if (reg) {
  reg.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(reg);
    const btn = reg.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    // Handle CV file conversion if UPLOAD mode
    let cvData = "";
    const hasCv = document.getElementById("hasCv")?.checked;
    const cvMode = hasCv ? "UPLOAD" : "MANUAL";
    const file = document.getElementById("cvFile")?.files[0];
    
    if (cvMode === "UPLOAD" && file) {
      cvData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    } else {
      // Create a beautiful HTML CV template
      const name = f.get("name");
      const email = f.get("email");
      const title = f.get("jobTitle");
      const exp = f.get("experienceYears");
      const skills = f.get("skills");
      const qual = f.get("qualification") || "N/A";
      const loc = f.get("preferredLocation") || "N/A";
      const remote = f.get("remote") === "on" ? "Yes" : "No";

      cvData = `
        <div style="font-family:sans-serif; max-width:800px; margin:0 auto; padding:2rem; border:1px solid #e5e7eb; border-radius:8px; background:#fff;">
          <div style="border-bottom:2px solid #3b82f6; padding-bottom:1rem; margin-bottom:1.5rem;">
            <h1 style="margin:0; font-size:2rem; color:#111827;">${name}</h1>
            <div style="color:#4b5563; margin-top:0.5rem;">${title} · ${loc} · ${email}</div>
          </div>
          <div style="margin-bottom:1.5rem;">
            <h3 style="color:#3b82f6; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Professional Summary</h3>
            <p style="margin-top:0.5rem; color:#374151;">Dedicated ${title} with ${exp} years of experience. Highly skilled in a variety of domains and open to ${remote === 'Yes' ? 'remote or on-site' : 'on-site'} opportunities.</p>
          </div>
          <div style="margin-bottom:1.5rem;">
            <h3 style="color:#3b82f6; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Key Skills</h3>
            <p style="margin-top:0.5rem; color:#374151;">${skills}</p>
          </div>
          <div style="margin-bottom:1.5rem;">
            <h3 style="color:#3b82f6; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Education & Qualifications</h3>
            <p style="margin-top:0.5rem; color:#374151;">${qual}</p>
          </div>
        </div>
      `;
    }

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          password: f.get("password"),
          jobTitle: f.get("jobTitle"),
          experienceYears: Number(f.get("experienceYears")),
          skills: f.get("skills").split(",").map(s => s.trim()).filter(Boolean),
          qualification: f.get("qualification"),
          preferredLocation: f.get("preferredLocation"),
          remotePreference: f.get("remote") === "on",
          cvType: cvMode,
          cvData: cvData
        })
      });
      show("Registration successful! Redirecting to login...", true);
      setTimeout(() => location.href = "login.html", 1200);
    } catch (err) {
      show(err.message, false);
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });
}

// ---- LOGIN ----
if (log) {
  // Auto-fill from localStorage if Remember Me was used previously
  const savedEmail = localStorage.getItem("techjobs_email");
  const savedPassword = localStorage.getItem("techjobs_password");
  if (savedEmail && savedPassword) {
    document.getElementById("email").value = savedEmail;
    document.getElementById("password").value = savedPassword;
    document.getElementById("remember").checked = true;
  }

  log.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(log);
    const btn = log.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Signing in...";
    
    const email = f.get("email");
    const password = f.get("password");
    const remember = f.get("remember") === "on";

    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe: remember })
      });
      
      // Save or clear credentials based on Remember Me checkbox
      if (remember) {
        localStorage.setItem("techjobs_email", email);
        localStorage.setItem("techjobs_password", password);
      } else {
        localStorage.removeItem("techjobs_email");
        localStorage.removeItem("techjobs_password");
      }

      // Route admin users to admin dashboard, regular users to user dashboard
      if (result.role === "ADMIN") {
        location.href = "admin.html";
      } else {
        location.href = "dashboard.html";
      }
    } catch (err) {
      show(err.message, false);
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  });
}
