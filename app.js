/* =============================================
   Promised Land — app.js
   Backend: Firebase Firestore (free tier)
   ============================================= */

// ── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://neujmakqnnwihfmynhfp.supabase.co";
const SUPABASE_ANON = "sb_publishable_IJXILB_QuchCSyM77qsmmw_68kv-P3w";
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ── FIREBASE INIT ─────────────────────────────────────────────────────────────
let db = null;
(async () => {
  try {
    const { initializeApp }    = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp }
      = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    window._fbFs = { collection, addDoc, getDocs, query, orderBy, Timestamp };
    loadRemoteProperties();
  } catch (e) {
    console.warn("Firebase not configured yet — running in demo mode.", e.message);
  }
})();

// ── SEED DATA (always shown; real listings append below) ─────────────────────
const SEED_PROPERTIES = [
  {
    id: "seed1", title: "Prime Residential Plot",
    type: "Plot", district: "Ramanathapuram", area: "Pamban Beach Road",
    price: 2500000, priceLabel: "₹25 Lakhs",
    size: "1200 sqft", phone: "9080581547",
    desc: "DTCP approved residential plot near Pamban Beach. Road access, water & electricity connection available. Ideal for villa construction.",
    photo: "", icon: "🌾", posted: true
  },
  {
    id: "seed2", title: "Luxury Sea View Villa",
    type: "Villa", district: "Chennai", area: "ECR, Kovalam",
    price: 12000000, priceLabel: "₹1.2 Cr",
    size: "2400 sqft", phone: "9080581547",
    desc: "3 BHK luxury villa with private garden, sea view, and premium finishes. Gated community with 24/7 security.",
    photo: "", icon: "🏠", posted: true
  },
  {
    id: "seed3", title: "Commercial Shop Space",
    type: "Commercial", district: "Madurai", area: "Anna Nagar Main Road",
    price: 4500000, priceLabel: "₹45 Lakhs",
    size: "800 sqft", phone: "9080581547",
    desc: "Ground floor commercial shop on busy high-street. Excellent footfall, suitable for any retail or service business.",
    photo: "", icon: "🏬", posted: true
  },
  {
    id: "seed4", title: "Agriculture Land",
    type: "Agriculture", district: "Thanjavur", area: "Papanasam",
    price: 1800000, priceLabel: "₹18 Lakhs",
    size: "2 Acres", phone: "9080581547",
    desc: "Fertile Cauvery delta farmland with borewell. Suitable for paddy, banana and sugarcane cultivation.",
    photo: "", icon: "🌿", posted: true
  },
  {
    id: "seed5", title: "Warehouse / Godown",
    type: "Warehouse", district: "Coimbatore", area: "SIDCO Industrial Estate",
    price: 8000000, priceLabel: "₹80 Lakhs",
    size: "5000 sqft", phone: "9080581547",
    desc: "Industrial warehouse with 3-phase power, loading bay and 24/7 security. On NH road, excellent logistics connectivity.",
    photo: "", icon: "🏭", posted: true
  },
  {
    id: "seed6", title: "Budget Plot – Near Highway",
    type: "Plot", district: "Virudhunagar", area: "Sattur Bypass",
    price: 900000, priceLabel: "₹9 Lakhs",
    size: "1500 sqft", phone: "9080581547",
    desc: "DTCP approved plot adjacent to NH highway bypass. Patta available. Clear title. Immediate registration possible.",
    photo: "", icon: "🌾", posted: true
  }
];

let allProperties = [...SEED_PROPERTIES];
let activeFilters  = { search: "", type: "", budget: "" };

// ── RENDER PROPERTIES ─────────────────────────────────────────────────────────
function renderProperties(list) {
  const grid = document.getElementById("propGrid");
  const none = document.getElementById("noResults");
  if (!list.length) {
    grid.innerHTML = "";
    none.style.display = "block";
    return;
  }
  none.style.display = "none";
  grid.innerHTML = list.map(p => `
    <div class="prop-card" onclick="openModal('${p.id}')">
      <div class="prop-card-img">
        ${p.photo
          ? `<img src="${p.photo}" alt="${p.title}" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
          : ""}
        <span style="${p.photo ? "display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:3rem" : ""}">${p.icon || "🏠"}</span>
        <div class="prop-badge">${p.type}</div>
      </div>
      <div class="prop-card-body">
        <h3>${p.title}</h3>
        <div class="prop-location">📍 ${p.area}, ${p.district}</div>
        <div class="prop-price">${p.priceLabel || formatPrice(p.price)}</div>
        <div class="prop-features">
          ${p.size ? `<span class="prop-feat">📐 ${p.size}</span>` : ""}
          <span class="prop-feat">✅ Verified</span>
        </div>
        <div class="prop-actions">
          <button class="btn-wa" onclick="event.stopPropagation();waContact('${p.phone}','${p.title}')">💬 WhatsApp</button>
          <button class="btn-detail" onclick="event.stopPropagation();openModal('${p.id}')">View Details</button>
        </div>
      </div>
    </div>
  `).join("");
}

function formatPrice(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── FILTERING ─────────────────────────────────────────────────────────────────
function filterProperties() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const type   = document.getElementById("filterType").value;
  const budget = document.getElementById("filterBudget").value;

  let filtered = allProperties.filter(p => {
    const matchSearch = !search
      || p.title.toLowerCase().includes(search)
      || p.district.toLowerCase().includes(search)
      || p.area.toLowerCase().includes(search);

    const matchType = !type || p.type === type;

    let matchBudget = true;
    if (budget) {
      const lakh = p.price / 100000;
      if (budget === "20") matchBudget = lakh < 20;
      else if (budget === "50") matchBudget = lakh >= 20 && lakh <= 50;
      else if (budget === "100") matchBudget = lakh > 50 && lakh <= 100;
      else if (budget === "999") matchBudget = lakh > 100;
    }

    return matchSearch && matchType && matchBudget;
  });

  renderProperties(filtered);
  document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
}

function setFilter(type) {
  document.getElementById("filterType").value = type;
  filterProperties();
}

function searchDistrict(district) {
  document.getElementById("searchInput").value = district;
  filterProperties();
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function openModal(id) {
  const p = allProperties.find(x => x.id === id);
  if (!p) return;
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-img" style="${p.photo ? "padding:0;overflow:hidden" : ""}">
      ${p.photo
        ? `<img src="${p.photo}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover">`
        : p.icon || "🏠"}
    </div>
    <div class="modal-title">${p.title}</div>
    <div class="modal-price">${p.priceLabel || formatPrice(p.price)}</div>
    <div class="modal-row">
      <span class="modal-tag">🏷️ ${p.type}</span>
      <span class="modal-tag">📍 ${p.district}</span>
      ${p.area ? `<span class="modal-tag">📌 ${p.area}</span>` : ""}
      ${p.size ? `<span class="modal-tag">📐 ${p.size}</span>` : ""}
    </div>
    <div class="modal-desc">${p.desc || "Contact us for more details about this property."}</div>
    <a class="modal-wa" href="https://wa.me/91${p.phone}?text=${encodeURIComponent("Hi, I'm interested in: " + p.title + " – " + p.district)}" target="_blank">
      💬 Contact on WhatsApp
    </a>
  `;
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function waContact(phone, title) {
  window.open(`https://wa.me/91${phone}?text=${encodeURIComponent("Hi, I'm interested in: " + title)}`, "_blank");
}

// ── CALCULATORS ───────────────────────────────────────────────────────────────
function showCalc(name) {
  document.querySelectorAll(".calc-box").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("calc-" + name).classList.add("active");
  event.target.classList.add("active");
}

function calcEMI() {
  const P = parseFloat(document.getElementById("emiAmount").value);
  const r = parseFloat(document.getElementById("emiRate").value) / 12 / 100;
  const n = parseFloat(document.getElementById("emiYears").value) * 12;
  if (!P || !r || !n) return alert("Please fill all fields.");
  const emi    = P * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
  const total  = emi * n;
  const interest = total - P;
  const el = document.getElementById("emiResult");
  el.innerHTML = `
    <strong style="font-size:1rem;color:var(--navy);display:block;margin-bottom:10px">📊 EMI Calculation Result</strong>
    <div class="result-grid">
      <div class="result-item"><strong>${formatPrice(Math.round(emi))}</strong><span>Monthly EMI</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(total))}</strong><span>Total Payment</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(interest))}</strong><span>Total Interest</span></div>
      <div class="result-item"><strong>${formatPrice(P)}</strong><span>Principal</span></div>
    </div>`;
  el.classList.add("show");
}

function calcStamp() {
  const val    = parseFloat(document.getElementById("stampValue").value);
  const type   = document.getElementById("stampType").value;
  const gender = document.getElementById("stampGender").value;
  if (!val) return alert("Enter property value.");

  // Tamil Nadu stamp duty rates (approx)
  let dutyRate = 0.07;   // 7% residential
  if (type === "commercial")  dutyRate = 0.07;
  if (type === "agriculture") dutyRate = 0.05;
  if (gender === "female" && type === "residential") dutyRate = 0.07; // same in TN currently

  const regFee   = Math.min(val * 0.01, 40000);  // 1% registration, max ₹40k (approx)
  const stamp    = val * dutyRate;
  const total    = stamp + regFee;

  const el = document.getElementById("stampResult");
  el.innerHTML = `
    <strong style="font-size:1rem;color:var(--navy);display:block;margin-bottom:10px">📜 TN Stamp Duty Estimate</strong>
    <div class="result-grid">
      <div class="result-item"><strong>${formatPrice(Math.round(stamp))}</strong><span>Stamp Duty (${(dutyRate*100).toFixed(0)}%)</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(regFee))}</strong><span>Registration Fee (~1%)</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(total))}</strong><span>Total Cost</span></div>
    </div>
    <small style="color:var(--text-muted);display:block;margin-top:10px">⚠️ Estimated figures based on current TN rates. Verify at your sub-registrar office.</small>`;
  el.classList.add("show");
}

function calcRental() {
  const val   = parseFloat(document.getElementById("rentalValue").value);
  const rent  = parseFloat(document.getElementById("rentalRent").value);
  const maint = parseFloat(document.getElementById("rentalMaint").value) || 0;
  if (!val || !rent) return alert("Fill property value and rent.");

  const annualRent   = rent * 12;
  const netRent      = annualRent - maint;
  const grossYield   = (annualRent / val) * 100;
  const netYield     = (netRent / val) * 100;
  const paybackYears = val / netRent;

  const el = document.getElementById("rentalResult");
  el.innerHTML = `
    <strong style="font-size:1rem;color:var(--navy);display:block;margin-bottom:10px">🏘️ Rental Yield Analysis</strong>
    <div class="result-grid">
      <div class="result-item"><strong>${grossYield.toFixed(2)}%</strong><span>Gross Yield</span></div>
      <div class="result-item"><strong>${netYield.toFixed(2)}%</strong><span>Net Yield</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(annualRent))}</strong><span>Annual Income</span></div>
      <div class="result-item"><strong>${paybackYears.toFixed(1)} yrs</strong><span>Break-even</span></div>
    </div>`;
  el.classList.add("show");
}

function calcAppreciation() {
  const val   = parseFloat(document.getElementById("appValue").value);
  const rate  = parseFloat(document.getElementById("appRate").value) / 100;
  const years = parseFloat(document.getElementById("appYears").value);
  if (!val || !rate || !years) return alert("Fill all fields.");

  const futureVal = val * Math.pow(1 + rate, years);
  const gain      = futureVal - val;

  const el = document.getElementById("appResult");
  el.innerHTML = `
    <strong style="font-size:1rem;color:var(--navy);display:block;margin-bottom:10px">📈 Property Appreciation</strong>
    <div class="result-grid">
      <div class="result-item"><strong>${formatPrice(Math.round(futureVal))}</strong><span>Value in ${years} yrs</span></div>
      <div class="result-item"><strong>${formatPrice(Math.round(gain))}</strong><span>Expected Gain</span></div>
      <div class="result-item"><strong>${(rate*100).toFixed(1)}%</strong><span>Growth Rate p.a.</span></div>
      <div class="result-item"><strong>${((gain/val)*100).toFixed(0)}%</strong><span>Total Return</span></div>
    </div>`;
  el.classList.add("show");
}

// ── POST PROPERTY ─────────────────────────────────────────────────────────────
async function submitProperty(e) {
  e.preventDefault();
  const data = {
    title:    document.getElementById("propTitle").value.trim(),
    type:     document.getElementById("propType").value,
    district: document.getElementById("propDistrict").value,
    area:     document.getElementById("propArea").value.trim(),
    price:    parseFloat(document.getElementById("propPrice").value),
    size:     document.getElementById("propSize").value.trim(),
    desc:     document.getElementById("propDesc").value.trim(),
    photo:    document.getElementById("propPhoto").value.trim(),
    phone:    document.getElementById("ownerPhone").value.replace(/\D/g,""),
    owner:    document.getElementById("ownerName").value.trim(),
    status:   "pending",
    createdAt: new Date().toISOString()
  };

  data.priceLabel = formatPrice(data.price);
  data.icon       = typeIcon(data.type);
  data.id         = "user_" + Date.now();

  // Save to Firebase if connected
  if (db) {
    try {
      const { collection, addDoc } = window._fbFs;
      await addDoc(collection(db, "properties"), data);
    } catch (err) {
      console.warn("Firestore write failed:", err.message);
    }
  }

  // Add to local display (pending badge)
  allProperties.unshift({ ...data, posted: false });
  renderProperties(allProperties);

  // Show success
  document.getElementById("postForm").style.display = "none";
  document.getElementById("postSuccess").style.display = "block";
  document.getElementById("postSuccess").scrollIntoView({ behavior: "smooth" });
}

function typeIcon(type) {
  const map = { Plot:"🌾", Villa:"🏠", Apartment:"🏢", Commercial:"🏬", Warehouse:"🏭", Hotel:"🍽️", Agriculture:"🌿" };
  return map[type] || "🏠";
}

// ── LOAD REMOTE PROPERTIES FROM FIRESTORE ────────────────────────────────────
async function loadRemoteProperties() {
  if (!db) return;
  try {
    const { collection, getDocs, query, orderBy } = window._fbFs;
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const remote = [];
    snap.forEach(doc => {
      const d = { id: doc.id, ...doc.data() };
      if (d.status === "approved") {
        d.icon = typeIcon(d.type);
        remote.push(d);
      }
    });
    allProperties = [...remote, ...SEED_PROPERTIES];
    renderProperties(allProperties);
  } catch (e) {
    console.warn("Could not load Firestore properties:", e.message);
  }
}

// ── HAMBURGER NAV ─────────────────────────────────────────────────────────────
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("mobileNav").classList.toggle("open");
});

// Close mobile nav on link click
document.querySelectorAll(".mobile-nav a").forEach(a => {
  a.addEventListener("click", () => document.getElementById("mobileNav").classList.remove("open"));
});

// ── STICKY HEADER SCROLL ──────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  const h = document.getElementById("header");
  h.style.boxShadow = window.scrollY > 10 ? "0 4px 24px rgba(0,0,0,0.4)" : "none";
});

// ── INITIAL RENDER ────────────────────────────────────────────────────────────
renderProperties(allProperties);

// ── LIVE SEARCH on Enter ──────────────────────────────────────────────────────
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") filterProperties();
});
