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
  const ageInput = document.getElementById("age");
  const genderInput = document.getElementById("gender");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const qualificationInput = document.getElementById("qualification");
  const preferredLocationInput = document.getElementById("preferredLocation");
  const skillsInput = document.getElementById("skills");
  const workExperienceInput = document.getElementById("workExperience");
  const passwordInput = document.getElementById("password");
  const pwdToggleBtn = document.getElementById("pwdToggleBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const eyeOffIcon = document.getElementById("eyeOffIcon");
  const submitBtn = document.getElementById("regSubmitBtn");

  if (pwdToggleBtn && passwordInput) {
    pwdToggleBtn.addEventListener("click", () => {
      const isPwd = passwordInput.type === "password";
      passwordInput.type = isPwd ? "text" : "password";
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.style.display = isPwd ? "none" : "block";
        eyeOffIcon.style.display = isPwd ? "block" : "none";
      }
    });
  }

  const setFieldError = (id, message) => {
    const errEl = document.getElementById(id + "-error");
    const inputEl = document.getElementById(id);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add("active");
    }
    if (inputEl) {
      inputEl.classList.add("input-invalid");
    }
  };

  const clearFieldError = (id) => {
    const errEl = document.getElementById(id + "-error");
    const inputEl = document.getElementById(id);
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.remove("active");
    }
    if (inputEl) {
      inputEl.classList.remove("input-invalid");
    }
  };

  const clearAllErrors = () => {
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

  // Clear errors on input
  [nameInput, ageInput, genderInput, emailInput, phoneInput, qualificationInput, preferredLocationInput, skillsInput, workExperienceInput, passwordInput].forEach(el => {
    if (el) {
      el.addEventListener("input", () => clearFieldError(el.id));
      el.addEventListener("change", () => clearFieldError(el.id));
    }
  });

  const validateForm = () => {
    clearAllErrors();
    let isValid = true;
    let firstInvalid = null;

    const fail = (id, message) => {
      setFieldError(id, message);
      isValid = false;
      if (!firstInvalid) firstInvalid = document.getElementById(id);
    };

    // 1. Full Name
    const nameVal = nameInput?.value.trim();
    if (!nameVal) {
      fail("name", "Full Name is required.");
    }

    // 2. Age
    const ageVal = parseInt(ageInput?.value, 10);
    if (isNaN(ageVal) || ageVal < 16 || ageVal > 99) {
      fail("age", "Please enter a valid age (16–99).");
    }

    // 3. Gender
    if (!genderInput?.value) {
      fail("gender", "Please select your gender.");
    }

    // 4. Email
    const emailVal = emailInput?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      fail("email", "Email Address is required.");
    } else if (!emailRegex.test(emailVal)) {
      fail("email", "Please enter a valid email address.");
    }

    // 5. Phone Number
    const phoneVal = phoneInput?.value.trim();
    const phoneClean = phoneVal.replace(/[\s\-\(\)\+]/g, "");
    if (!phoneVal) {
      fail("phone", "Phone Number is required.");
    } else if (phoneClean.length < 7 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
      fail("phone", "Please enter a valid phone number.");
    }

    // 6. Qualification
    if (!qualificationInput?.value) {
      fail("qualification", "Please select your highest qualification.");
    }

    // 7. Preferred Location (optional)

    // 8. Skills (optional)

    // 9. Work Experience
    if (!workExperienceInput?.value) {
      fail("workExperience", "Please select your work experience.");
    }

    // 10. Password
    const passwordVal = passwordInput?.value;
    if (!passwordVal) {
      fail("password", "Password is required.");
    } else if (passwordVal.length < 6) {
      fail("password", "Password must be at least 6 characters.");
    }

    if (!isValid && firstInvalid) {
      firstInvalid.focus();
    }

    return isValid;
  };

  reg.addEventListener("submit", async e => {
    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value, 10);
    const gender = genderInput.value;
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const qualification = qualificationInput.value;
    const preferredLocation = preferredLocationInput.value.trim();
    const rawSkills = skillsInput.value.trim();
    const workExperience = workExperienceInput.value;
    const password = passwordInput.value;

    // Map work experience dropdown string to numeric years for backend validation (@Min(0) @Max(50))
    let experienceYears = 0;
    if (workExperience === "Less than 1 year") experienceYears = 1;
    else if (workExperience === "1–3 years") experienceYears = 2;
    else if (workExperience === "3+ years") experienceYears = 4;

    // Parse skills into array (handle commas or linebreaks)
    const skillsList = rawSkills
      ? rawSkills.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : ["General"];

    // Target role derived from qualification or skills (as backend requires non-blank jobTitle)
    const jobTitle = skillsList[0] && skillsList[0] !== "General"
      ? `${skillsList[0]} Specialist`
      : "Software Professional";

    // Text summary of profile for manual CV data
    const summaryText = `
Name: ${name}
Age: ${age} | Gender: ${gender}
Email: ${email} | Phone: ${phone}
Highest Qualification: ${qualification}
Experience: ${workExperience} (${experienceYears} yrs)
Skills: ${skillsList.join(", ")}
Preferred Location: ${preferredLocation || "Not specified"}
    `.trim();

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          jobTitle,
          experienceYears,
          skills: skillsList,
          qualification: `${qualification} (Age: ${age}, Gender: ${gender}, Phone: ${phone})`,
          preferredLocation: preferredLocation || "Any",
          remotePreference: false,
          cvType: "MANUAL",
          cvData: summaryText
        })
      });

      show("Registration successful! Redirecting to sign in...", true);
      setTimeout(() => {
        location.href = "login.html";
      }, 1200);
    } catch (err) {
      let errMsg = err.message || "Registration failed. Please try again.";
      if (errMsg.toLowerCase().includes("conflict") || errMsg.toLowerCase().includes("already registered")) {
        errMsg = "This email is already registered. Please sign in or use a different email.";
        setFieldError("email", "Email already registered.");
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
