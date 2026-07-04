document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize Translation System ---
  let currentLang = localStorage.getItem("mercy_bridge_lang") || "en";
  applyTranslations(currentLang);

  // Language Button Click
  const langToggleBtn = document.getElementById("lang-toggle");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "am" : "en";
      localStorage.setItem("mercy_bridge_lang", currentLang);
      applyTranslations(currentLang);
    });
  }

  // --- Mobile Menu Toggle ---
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      mobileMenuToggle.classList.toggle("active");
    });
  }

  // --- Highlight Active Link ---
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // --- Form & Page Interactions ---
  setupDonationForm();
  setupVolunteerForm();
  setupRequestHelpForm();
  setupContactForm();
  setupLoginForm();
  setupAdminDashboard();
  setupFilterSearch();
  setupFaqAccordion();
});

// Apply Translations helper
function applyTranslations(lang) {
  document.documentElement.setAttribute("lang", lang);

  // Set Ethiopic font styles for body if Amharic
  if (lang === "am") {
    document.body.classList.add("lang-am");
    document.body.classList.remove("lang-en");
  } else {
    document.body.classList.add("lang-en");
    document.body.classList.remove("lang-am");
  }

  const keys = translations[lang];
  if (!keys) return;

  // Translate elements with data-i18n
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (keys[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", keys[key]);
      } else {
        el.textContent = keys[key];
      }
    }
  });

  // Update button language display
  const langToggleBtn = document.getElementById("lang-toggle");
  if (langToggleBtn) {
    langToggleBtn.textContent = lang === "en" ? "አማርኛ" : "English";
  }
}

// Show Toast feedback
function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === "success" ? "✓" : "✗"}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 1. Donate Page Logic
function setupDonationForm() {
  const donateForm = document.getElementById("donate-form");
  if (!donateForm) return;

  const amountButtons = document.querySelectorAll(".amt-btn");
  const customAmountInput = document.getElementById("custom-amount");
  let selectedAmount = "50"; // default preset

  amountButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      amountButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      customAmountInput.value = "";
      selectedAmount = btn.getAttribute("data-amount");
    });
  });

  customAmountInput.addEventListener("input", () => {
    amountButtons.forEach(b => b.classList.remove("active"));
    selectedAmount = customAmountInput.value;
  });

  donateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const finalAmount = customAmountInput.value || selectedAmount;
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      showToast(localStorage.getItem("mercy_bridge_lang") === "am" ? "እባክዎን ትክክለኛ የልገሳ መጠን ያስገቡ።" : "Please enter a valid donation amount.", "error");
      return;
    }

    const lang = localStorage.getItem("mercy_bridge_lang") || "en";
    const thankYou = lang === "am" ? translations.am.donate_success_msg : translations.en.donate_success_msg;
    
    showToast(`${thankYou} Amount: $${finalAmount}`);
    donateForm.reset();
    amountButtons.forEach(b => b.classList.remove("active"));
    if (amountButtons[1]) amountButtons[1].classList.add("active"); // reset to default
  });
}

// 2. Volunteer Page Logic
function setupVolunteerForm() {
  const volunteerForm = document.getElementById("volunteer-form");
  if (!volunteerForm) return;

  volunteerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Validate checkboxes
    const checkedInterests = document.querySelectorAll('input[name="interests"]:checked');
    if (checkedInterests.length === 0) {
      showToast(localStorage.getItem("mercy_bridge_lang") === "am" ? "እባክዎን ቢያንስ አንድ የፍላጎት መስክ ይምረጡ።" : "Please select at least one area of interest.", "error");
      return;
    }

    const lang = localStorage.getItem("mercy_bridge_lang") || "en";
    const msg = lang === "am" ? translations.am.vol_success_msg : translations.en.vol_success_msg;
    showToast(msg);
    volunteerForm.reset();
  });
}

// 3. Request Help Page Logic
function setupRequestHelpForm() {
  const requestForm = document.getElementById("request-help-form");
  if (!requestForm) return;

  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("mercy_bridge_lang") || "en";
    const msg = lang === "am" ? translations.am.req_success_msg : translations.en.req_success_msg;
    
    // Simulate saving request to localstorage so it shows up in Admin Dashboard
    const name = document.getElementById("req-name").value;
    const category = document.getElementById("req-category").value;
    const urgency = document.getElementById("req-urgency").value;
    const desc = document.getElementById("req-desc").value;
    const address = document.getElementById("req-address").value;

    const newRequest = {
      name,
      category,
      urgency,
      desc,
      address,
      date: new Date().toLocaleDateString(),
      status: "Pending"
    };

    let requestsList = JSON.parse(localStorage.getItem("mb_help_requests")) || [];
    requestsList.unshift(newRequest);
    localStorage.setItem("mb_help_requests", JSON.stringify(requestsList));

    showToast(msg);
    requestForm.reset();
  });
}

// 4. Contact Page Logic
function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("mercy_bridge_lang") || "en";
    const msg = lang === "am" ? "እናመሰግናለን! መልዕክትዎ በተሳካ ሁኔታ ተልኳል።" : "Thank you! Your message has been sent successfully.";
    showToast(msg);
    contactForm.reset();
  });
}

// 5. Login Page Logic
function setupLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "admin123") {
      showToast(localStorage.getItem("mercy_bridge_lang") === "am" ? "በተሳካ ሁኔታ ገብተዋል። ወደ መቆጣጠሪያ ሰሌዳው በመጓዝ ላይ..." : "Signed in successfully. Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } else {
      showToast(localStorage.getItem("mercy_bridge_lang") === "am" ? "ትክክለኛ ያልሆነ የተጠቃሚ ስም ወይም የይለፍ ቃል!" : "Invalid username or password!", "error");
    }
  });
}

// 6. Admin Dashboard Page Logic
function setupAdminDashboard() {
  const adminPage = document.querySelector(".admin-dashboard-container");
  if (!adminPage) return;

  // Initialize some fake dashboard data if not present
  if (!localStorage.getItem("mb_donations")) {
    const initialDonations = [
      { name: "John Doe", need: "Medical Expense (Bethel)", amount: "$150.00", date: "2026-07-04" },
      { name: "Selamawit Kebede", need: "School Kits", amount: "$50.00", date: "2026-07-03" },
      { name: "St. Stephens Church", need: "Food Security Fund", amount: "$1,000.00", date: "2026-07-02" }
    ];
    localStorage.setItem("mb_donations", JSON.stringify(initialDonations));
  }

  if (!localStorage.getItem("mb_help_requests")) {
    const initialRequests = [
      { name: "Almaz Tesfaye", category: "Food Support", urgency: "High", desc: "Elderly widow needing emergency food rations.", address: "Arada, Kebela 09", date: "2026-07-04", status: "Pending" },
      { name: "Yoseph Bekele", category: "Shelter Support", urgency: "Medium", desc: "Requesting blanket supplies for orphanage home.", address: "Yeka, Addis Ababa", date: "2026-07-03", status: "Approved" }
    ];
    localStorage.setItem("mb_help_requests", JSON.stringify(initialRequests));
  }

  // Load Dashboard Stats
  updateDashboardStats();

  // Load Tables
  renderHelpRequestsTable();
  renderDonationsTable();

  // Handle New Need Form
  const newNeedForm = document.getElementById("admin-need-form");
  if (newNeedForm) {
    newNeedForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("need-title").value;
      const goal = document.getElementById("need-goal").value;
      const desc = document.getElementById("need-desc").value;
      
      // Simply alert that the new need is added to current needs (mock logic)
      const lang = localStorage.getItem("mercy_bridge_lang") || "en";
      const successMsg = lang === "am" ? "አዲስ ፍላጎት በተሳካ ሁኔታ ተለጥፏል!" : "New Need posted successfully!";
      
      showToast(successMsg);
      newNeedForm.reset();
    });
  }
}

function updateDashboardStats() {
  const pendingRequestsCount = document.getElementById("stat-pending-requests");
  const requests = JSON.parse(localStorage.getItem("mb_help_requests")) || [];
  const pending = requests.filter(r => r.status === "Pending").length;

  if (pendingRequestsCount) {
    pendingRequestsCount.textContent = pending;
  }
}

function renderHelpRequestsTable() {
  const tableBody = document.getElementById("admin-requests-body");
  if (!tableBody) return;

  const requests = JSON.parse(localStorage.getItem("mb_help_requests")) || [];
  tableBody.innerHTML = "";

  if (requests.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No requests found.</td></tr>`;
    return;
  }

  requests.forEach((req, idx) => {
    const tr = document.createElement("tr");
    
    // Status Badge Class
    let badgeClass = "badge-pending";
    if (req.status === "Approved") badgeClass = "badge-approved";
    if (req.status === "Denied" || req.status === "Rejected") badgeClass = "badge-denied";

    tr.innerHTML = `
      <td><strong>${req.name}</strong><br><small style="color:var(--text-gray);">${req.address}</small></td>
      <td>
        <span class="category-indicator">${req.category}</span>
        <br><small style="color:var(--text-gray);">${req.desc}</small>
      </td>
      <td><span class="urgency-tag ${req.urgency.toLowerCase()}">${req.urgency}</span></td>
      <td><span class="status-badge ${badgeClass}">${req.status}</span></td>
      <td>
        ${req.status === "Pending" ? `
          <button class="btn btn-sm btn-primary action-btn-approve" data-index="${idx}">Approve</button>
          <button class="btn btn-sm btn-outline action-btn-deny" style="color:var(--color-denied); border-color:var(--color-denied);" data-index="${idx}">Deny</button>
        ` : `<span style="color:var(--text-gray);">Reviewed</span>`}
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Attach button events
  document.querySelectorAll(".action-btn-approve").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      updateRequestStatus(idx, "Approved");
    });
  });

  document.querySelectorAll(".action-btn-deny").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      updateRequestStatus(idx, "Denied");
    });
  });
}

function updateRequestStatus(index, newStatus) {
  let requests = JSON.parse(localStorage.getItem("mb_help_requests")) || [];
  if (requests[index]) {
    requests[index].status = newStatus;
    localStorage.setItem("mb_help_requests", JSON.stringify(requests));
    showToast(`Request marked as ${newStatus}`);
    renderHelpRequestsTable();
    updateDashboardStats();
  }
}

function renderDonationsTable() {
  const tableBody = document.getElementById("admin-donations-body");
  if (!tableBody) return;

  const donations = JSON.parse(localStorage.getItem("mb_donations")) || [];
  tableBody.innerHTML = "";

  donations.forEach(donation => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${donation.name}</strong></td>
      <td>${donation.need}</td>
      <td style="color: var(--color-green); font-weight: 600;">${donation.amount}</td>
      <td>${donation.date}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// 7. Search & Filter logic (Needs & Churches page)
function setupFilterSearch() {
  // Search bar logic
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  
  if (!searchInput && filterButtons.length === 0) return;

  const items = document.querySelectorAll(".searchable-card");

  function filterItems() {
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const category = item.getAttribute("data-category") || "";
      const matchesSearch = text.includes(query);
      const matchesFilter = activeFilter === "all" || category.toLowerCase() === activeFilter.toLowerCase();

      if (matchesSearch && matchesFilter) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterItems);
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterItems();
    });
  });
}

// 8. Contact FAQ Accordion
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        // Toggle active class on item
        const isActive = item.classList.contains("active");
        faqItems.forEach(i => i.classList.remove("active"));
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });
}
