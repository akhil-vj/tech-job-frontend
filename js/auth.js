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
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const jobTitleInput = document.getElementById("jobTitle");
  const experienceYearsInput = document.getElementById("experienceYears");
  const skillsInput = document.getElementById("skills");
  const qualificationInput = document.getElementById("qualification");
  const preferredLocationInput = document.getElementById("preferredLocation");
  const remoteInput = document.getElementById("remote");
  const hasCvCheckbox = document.getElementById("hasCv");
  
  const jobTitleUpload = document.getElementById("jobTitleUpload");
  const skillsUpload = document.getElementById("skillsUpload");
  
  const manualProfileSection = document.getElementById("manualProfileSection");
  const cvUploadSection = document.getElementById("cvUploadSection");
  const cvDropzone = document.getElementById("cvDropzone");
  const cvFileInput = document.getElementById("cvFile");
  const cvFilePreview = document.getElementById("cvFilePreview");
  const cvFileName = document.getElementById("cvFileName");
  const cvFileSize = document.getElementById("cvFileSize");
  const cvFileRemove = document.getElementById("cvFileRemove");
  const passwordStrength = document.getElementById("password-strength");
  
  const modeRadios = document.querySelectorAll('input[name="profileMode"]');
  const manualLabel = document.getElementById("mode-manual-label");
  const uploadLabel = document.getElementById("mode-upload-label");
  const submitBtn = document.getElementById("regSubmitBtn");

  // Keep manual vs upload inputs in sync so user doesn't lose data
  if (jobTitleInput && jobTitleUpload) {
    jobTitleInput.addEventListener("input", () => { jobTitleUpload.value = jobTitleInput.value; });
    jobTitleUpload.addEventListener("input", () => { jobTitleInput.value = jobTitleUpload.value; });
  }
  if (skillsInput && skillsUpload) {
    skillsInput.addEventListener("input", () => { skillsUpload.value = skillsInput.value; });
    skillsUpload.addEventListener("input", () => { skillsInput.value = skillsUpload.value; });
  }

  // Password Visibility Toggle
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPass = input.type === "password";
      input.type = isPass ? "text" : "password";
      btn.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
      const eyeIcon = btn.querySelector(".eye-icon");
      const eyeOffIcon = btn.querySelector(".eye-off-icon");
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.style.display = isPass ? "none" : "block";
        eyeOffIcon.style.display = isPass ? "block" : "none";
      }
    });
  });

  // Password Strength Indicator
  if (passwordInput && passwordStrength) {
    passwordInput.addEventListener("input", () => {
      const val = passwordInput.value;
      if (!val) {
        passwordStrength.className = "password-strength";
        passwordStrength.textContent = "";
        return;
      }
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        passwordStrength.className = "password-strength weak";
        passwordStrength.textContent = "Weak password (add numbers/letters)";
      } else if (score <= 3) {
        passwordStrength.className = "password-strength medium";
        passwordStrength.textContent = "Medium strength password";
      } else {
        passwordStrength.className = "password-strength strong";
        passwordStrength.textContent = "Strong password";
      }
    });
  }

  // Profile Mode Switcher (Manual vs Upload)
  const setProfileMode = (mode) => {
    const isUpload = mode === "upload";
    if (hasCvCheckbox) hasCvCheckbox.checked = isUpload;

    if (manualLabel && uploadLabel) {
      manualLabel.classList.toggle("resume-mode-option--active", !isUpload);
      uploadLabel.classList.toggle("resume-mode-option--active", isUpload);
    }

    if (manualProfileSection && cvUploadSection) {
      manualProfileSection.style.display = isUpload ? "none" : "block";
      cvUploadSection.style.display = isUpload ? "block" : "none";
    }

    // Toggle required attributes to match active mode
    if (jobTitleInput) jobTitleInput.required = !isUpload;
    if (experienceYearsInput) experienceYearsInput.required = !isUpload;
    if (skillsInput) skillsInput.required = !isUpload;
    if (jobTitleUpload) jobTitleUpload.required = isUpload;
    if (skillsUpload) skillsUpload.required = isUpload;

    clearErrors();
  };

  modeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      setProfileMode(e.target.value);
    });
  });

  // CV File Upload & Drag-and-Drop
  const handleSelectedFile = (file) => {
    clearFieldError("cvFile");
    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedExtensions.includes(ext)) {
      setFieldError("cvFile", "Please upload a valid PDF, DOC, or DOCX document.");
      cvFileInput.value = "";
      return;
    }

    if (file.size > maxSizeBytes) {
      setFieldError("cvFile", "File size exceeds the 5 MB limit.");
      cvFileInput.value = "";
      return;
    }

    if (cvFileName) cvFileName.textContent = file.name;
    if (cvFileSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      cvFileSize.textContent = `(${sizeMb} MB)`;
    }
    if (cvDropzone) cvDropzone.style.display = "none";
    if (cvFilePreview) cvFilePreview.style.display = "flex";
  };

  if (cvFileInput) {
    cvFileInput.addEventListener("change", (e) => {
      handleSelectedFile(e.target.files[0]);
    });
  }

  if (cvDropzone) {
    ["dragenter", "dragover"].forEach(evtName => {
      cvDropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        cvDropzone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach(evtName => {
      cvDropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        cvDropzone.classList.remove("drag-over");
      });
    });

    cvDropzone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        cvFileInput.files = dt.files;
        handleSelectedFile(dt.files[0]);
      }
    });
  }

  if (cvFileRemove) {
    cvFileRemove.addEventListener("click", () => {
      if (cvFileInput) cvFileInput.value = "";
      if (cvFilePreview) cvFilePreview.style.display = "none";
      if (cvDropzone) cvDropzone.style.display = "block";
      clearFieldError("cvFile");
    });
  }

  // Field-specific validation helpers
  const setFieldError = (fieldId, message) => {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("active");
    }
    if (inputEl) {
      inputEl.classList.add("input-invalid");
    }
  };

  const clearFieldError = (fieldId) => {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("active");
    }
    if (inputEl) {
      inputEl.classList.remove("input-invalid");
    }
  };

  const clearErrors = () => {
    document.querySelectorAll(".field-error").forEach(el => {
      el.textContent = "";
      el.classList.remove("active");
    });
    document.querySelectorAll(".input-invalid").forEach(el => {
      el.classList.remove("input-invalid");
    });
    if (msg) {
      msg.style.display = "none";
      msg.textContent = "";
    }
  };

  // Live error clear on typing
  [nameInput, emailInput, passwordInput, confirmPasswordInput, jobTitleInput, jobTitleUpload, experienceYearsInput, skillsInput, skillsUpload].forEach(input => {
    if (input) {
      input.addEventListener("input", () => clearFieldError(input.id));
    }
  });

  // Client Validation function
  const validateForm = () => {
    clearErrors();
    let isValid = true;
    let firstInvalidInput = null;

    const markInvalid = (id, message, elementToFocus) => {
      setFieldError(id, message);
      isValid = false;
      if (!firstInvalidInput) {
        firstInvalidInput = elementToFocus || document.getElementById(id);
      }
    };

    // Full Name
    const nameVal = nameInput?.value.trim();
    if (!nameVal) {
      markInvalid("name", "Please enter your full name.");
    }

    // Email
    const emailVal = emailInput?.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      markInvalid("email", "Please enter your email address.");
    } else if (!emailPattern.test(emailVal)) {
      markInvalid("email", "Please enter a valid email address.");
    }

    // Password
    const passwordVal = passwordInput?.value;
    if (!passwordVal) {
      markInvalid("password", "Please enter a password.");
    } else if (passwordVal.length < 6) {
      markInvalid("password", "Password must be at least 6 characters long.");
    }

    // Confirm Password
    const confirmVal = confirmPasswordInput?.value;
    if (!confirmVal) {
      markInvalid("confirmPassword", "Please confirm your password.");
    } else if (passwordVal !== confirmVal) {
      markInvalid("confirmPassword", "Passwords do not match.");
    }

    const currentMode = document.querySelector('input[name="profileMode"]:checked')?.value || "manual";

    if (currentMode === "manual") {
      // Target Role
      if (!jobTitleInput?.value.trim()) {
        markInvalid("jobTitle", "Please specify your target job role.");
      }

      // Experience
      const expVal = Number(experienceYearsInput?.value);
      if (isNaN(expVal) || expVal < 0 || expVal > 50) {
        markInvalid("experienceYears", "Experience must be between 0 and 50 years.");
      }

      // Skills
      const skillsVal = skillsInput?.value.trim();
      const parsedSkills = skillsVal ? skillsVal.split(",").map(s => s.trim()).filter(Boolean) : [];
      if (!parsedSkills.length) {
        markInvalid("skills", "Please enter at least one key skill.");
      }
    } else {
      // Upload Mode Validation
      const file = cvFileInput?.files?.[0];
      if (!file) {
        markInvalid("cvFile", "Please select a resume file to upload.", cvFileInput);
      }

      if (!jobTitleUpload?.value.trim()) {
        markInvalid("jobTitleUpload", "Please specify your target job role.");
      }

      const skillsUploadVal = skillsUpload?.value.trim();
      const parsedSkillsUpload = skillsUploadVal ? skillsUploadVal.split(",").map(s => s.trim()).filter(Boolean) : [];
      if (!parsedSkillsUpload.length) {
        markInvalid("skillsUpload", "Please enter at least one key skill.");
      }
    }

    if (!isValid && firstInvalidInput) {
      firstInvalidInput.focus();
    }

    return isValid;
  };

  // Form submission handler
  reg.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const currentMode = document.querySelector('input[name="profileMode"]:checked')?.value || "manual";
    const isUpload = currentMode === "upload";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const jobTitle = isUpload ? jobTitleUpload.value.trim() : jobTitleInput.value.trim();
    const experienceYears = isUpload ? 0 : Number(experienceYearsInput.value || 0);
    const rawSkills = isUpload ? skillsUpload.value : skillsInput.value;
    const skills = rawSkills.split(",").map(s => s.trim()).filter(Boolean);
    const qualification = qualificationInput ? qualificationInput.value.trim() : "";
    const preferredLocation = preferredLocationInput ? preferredLocationInput.value.trim() : "";
    const remotePreference = remoteInput ? remoteInput.checked : false;

    let cvData = "";
    const cvMode = isUpload ? "UPLOAD" : "MANUAL";

    try {
      if (isUpload) {
        const file = cvFileInput.files[0];
        cvData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read CV file"));
          reader.readAsDataURL(file);
        });
      } else {
        const qual = qualification || "N/A";
        const loc = preferredLocation || "N/A";
        const remoteText = remotePreference ? "Yes" : "No";

        cvData = `
          <div style="font-family:sans-serif; max-width:800px; margin:0 auto; padding:2rem; border:1px solid #e5e7eb; border-radius:8px; background:#fff;">
            <div style="border-bottom:2px solid #000; padding-bottom:1rem; margin-bottom:1.5rem;">
              <h1 style="margin:0; font-size:2rem; color:#111827;">${esc(name)}</h1>
              <div style="color:#4b5563; margin-top:0.5rem;">${esc(jobTitle)} · ${esc(loc)} · ${esc(email)}</div>
            </div>
            <div style="margin-bottom:1.5rem;">
              <h3 style="color:#000; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Professional Summary</h3>
              <p style="margin-top:0.5rem; color:#374151;">Dedicated ${esc(jobTitle)} with ${experienceYears} years of experience. Open to ${remoteText === 'Yes' ? 'remote or on-site' : 'on-site'} opportunities.</p>
            </div>
            <div style="margin-bottom:1.5rem;">
              <h3 style="color:#000; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Key Skills</h3>
              <p style="margin-top:0.5rem; color:#374151;">${esc(skills.join(", "))}</p>
            </div>
            <div style="margin-bottom:1.5rem;">
              <h3 style="color:#000; text-transform:uppercase; font-size:0.875rem; letter-spacing:0.05em;">Education & Qualifications</h3>
              <p style="margin-top:0.5rem; color:#374151;">${esc(qual)}</p>
            </div>
          </div>
        `;
      }

      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          jobTitle,
          experienceYears,
          skills,
          qualification,
          preferredLocation,
          remotePreference,
          cvType: cvMode,
          cvData
        })
      });

      show("Registration successful! Redirecting to login...", true);
      setTimeout(() => {
        location.href = "login.html";
      }, 1200);
    } catch (err) {
      let errMsg = err.message || "Registration failed. Please try again.";
      if (errMsg.toLowerCase().includes("conflict") || errMsg.toLowerCase().includes("already registered")) {
        errMsg = "This email is already registered. Please sign in or use a different email.";
        setFieldError("email", "Email already in use.");
      }
      show(errMsg, false);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
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
