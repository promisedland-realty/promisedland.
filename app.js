/* =============================================
   Promised Land — app.js
   Backend: Supabase (100% Free)
   ============================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL  = "https://neujmakqnnwihfmynhfp.supabase.co";
const SUPABASE_ANON = "sb_publishable_IJXILB_QuchCSyM77qsmmw_68kv-P3w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── SEED DATA (always visible as demo) ── */
const SEED = [
  { id:"s1", title:"Prime Residential Plot",  type:"Plot",        district:"Ramanathapuram", area:"Pamban Beach Road",       price:2500000,  size:"1200 sqft", phone:"9080581547", description:"DTCP approved plot near Pamban Beach. Road access, water & electricity available.", photo_url:"" },
  { id:"s2", title:"Luxury Sea View Villa",   type:"Villa",       district:"Chennai",        area:"ECR, Kovalam",            price:12000000, size:"2400 sqft", phone:"9080581547", description:"3 BHK luxury villa with private garden & sea view. Gated community, 24/7 security.", photo_url:"" },
  { id:"s3", title:"Commercial Shop Space",   type:"Commercial",  district:"Madurai",        area:"Anna Nagar Main Road",    price:4500000,  size:"800 sqft",  phone:"9080581547", description:"Ground floor shop on busy high-street. Excellent footfall, ready for any business.", photo_url:"" },
  { id:"s4", title:"Agriculture Land",        type:"Agriculture", district:"Thanjavur",      area:"Papanasam",               price:1800000,  size:"2 Acres",   phone:"9080581547", description:"Fertile Cauvery delta farmland with borewell. Suitable for paddy and banana.", photo_url:"" },
  { id:"s5", title:"Industrial Warehouse",    type:"Warehouse",   district:"Coimbatore",     area:"SIDCO Industrial Estate", price:8000000,  size:"5000 sqft", phone:"9080581547", description:"3-phase power, loading bay, 24/7 security. On NH road — great logistics access.", photo_url:"" },
  { id:"s6", title:"Budget Highway Plot",     type:"Plot",        district:"Virudhunagar",   area:"Sattur Bypass",           price:900000,   size:"1500 sqft", phone:"9080581547", description:"DTCP approved. Patta available. Clear title. Immediate registration possible.", photo_url:"" }
];

let allProperties = [...SEED];

/* ── LOAD APPROVED FROM SUPABASE ── */
async function loadProperties() {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      allProperties = [...data, ...SEED];
    }
  } catch(e) {
    console.warn("Could not load from Supabase:", e.message);
  }
  renderProperties(allProperties);
}

/* ── HELPERS ── */
function formatPrice(n) {
  if (!n) return "Price on Request";
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function typeIcon(t) {
  return { Plot:"🌾", Villa:"🏠", Apartment:"🏢", Commercial:"🏬",
           Warehouse:"🏭", Hotel:"🍽️", Agriculture:"🌿" }[t] || "🏠";
}

/* ── RENDER ── */
function renderProperties(list) {
  const grid = document.getElementById("propGrid");
  const none = document.getElementById("noResults");
  if (!list || !list.length) {
    grid.innerHTML = "";
    none.style.display = "block";
    return;
  }
  none.style.display = "none";
  grid.innerHTML = list.map(p => `
    <div class="prop-card" onclick="openModal('${p.id}')">
      <div class="prop-card-img">
        ${p.photo_url
          ? `<img src="${p.photo_url}" alt="${p.title}" onerror="this.style.display='none'">`
          : `<span style="font-size:3rem">${typeIcon(p.type)}</span>`}
        <div class="prop-badge">${p.type}</div>
      </div>
      <div class="prop-card-body">
        <h3>${p.title}</h3>
        <div class="prop-location">📍 ${p.area || ""}, ${p.district}</div>
        <div class="prop-price">${formatPrice(p.price)}</div>
        <div class="prop-features">
          ${p.size ? `<span class="prop-feat">📐 ${p.size}</span>` : ""}
          <span class="prop-feat">✅ Verified</span>
        </div>
        <div class="prop-actions">
          <button class="btn-wa"     onclick="event.stopPropagation();waContact('${p.phone}','${p.title}')">💬 WhatsApp</button>
          <button class="btn-detail" onclick="event.stopPropagation();openModal('${p.id}')">View Details</button>
        </div>
      </div>
    </div>`).join("");
}

/* ── FILTER ── */
window.filterProperties = function() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const type   = document.getElementById("filterType").value;
  const budget = document.getElementById("filterBudget").value;

  const filtered = allProperties.filter(p => {
    const ms = !search
      || (p.title||"").toLowerCase().includes(search)
      || (p.district||"").toLowerCase().includes(search)
      || (p.area||"").toLowerCase().includes(search);
    const mt = !type || p.type === type;
    let mb = true;
    if (budget) {
      const l = p.price / 100000;
      if      (budget === "20")  mb = l < 20;
      else if (budget === "50")  mb = l >= 20 && l <= 50;
      else if (budget === "100") mb = l > 50  && l <= 100;
      else if (budget === "999") mb = l > 100;
    }
    return ms && mt && mb;
  });
  renderProperties(filtered);
  document.getElementById("properties").scrollIntoView({ behavior:"smooth" });
};

window.setFilter = function(type) {
  document.getElementById("filterType").value = type;
  window.filterProperties();
};

window.searchDistrict = function(dist) {
  document.getElementById("searchInput").value = dist;
  window.filterProperties();
};

/* ── MODAL ── */
window.openModal = function(id) {
  const p = allProperties.find(x => String(x.id) === String(id));
  if (!p) return;
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-img" style="${p.photo_url ? "padding:0;overflow:hidden;background:none" : ""}">
      ${p.photo_url
        ? `<img src="${p.photo_url}" style="width:100%;height:100%;object-fit:cover">`
        : typeIcon(p.type)}
    </div>
    <div class="modal-title">${p.title}</div>
    <div class="modal-price">${formatPrice(p.price)}</div>
    <div class="modal-row">
      <span class="modal-tag">🏷️ ${p.type}</span>
      <span class="modal-tag">📍 ${p.district}</span>
      ${p.area ? `<span class="modal-tag">📌 ${p.area}</span>` : ""}
      ${p.size ? `<span class="modal-tag">📐 ${p.size}</span>` : ""}
    </div>
    <div class="modal-desc">${p.description || "Contact us for more details."}</div>
    <a class="modal-wa"
       href="https://wa.me/91${p.phone}?text=${encodeURIComponent("Hi, I'm interested in: " + p.title + " – " + p.district)}"
       target="_blank">💬 Contact on WhatsApp</a>`;
  document.getElementById("modalOverlay").classList.add("open");
};

window.closeModal = function() {
  document.getElementById("modalOverlay").classList.remove("open");
};

window.waContact = function(phone, title) {
  window.open(`https://wa.me/91${phone}?text=${encodeURIComponent("Hi, I'm interested in: " + title)}`, "_blank");
};

/* ── CALCULATORS ── */
window.showCalc = function(name) {
  document.querySelectorAll(".calc-box").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("calc-" + name).classList.add("active");
  event.target.classList.add("active");
};

function showResult(id, title, rows, note = "") {
  const el = document.getElementById(id);
  el.innerHTML = `
    <strong style="font-size:1rem;color:var(--navy);display:block;margin-bottom:12px">${title}</strong>
    <div class="result-grid">
      ${rows.map(([v,l]) => `<div class="result-item"><strong>${v}</strong><span>${l}</span></div>`).join("")}
    </div>
    ${note ? `<small style="color:var(--text-muted);display:block;margin-top:10px">${note}</small>` : ""}`;
  el.classList.add("show");
}

window.calcEMI = function() {
  const P = +document.getElementById("emiAmount").value;
  const r = +document.getElementById("emiRate").value / 12 / 100;
  const n = +document.getElementById("emiYears").value * 12;
  if (!P||!r||!n) return alert("Please fill all fields.");
  const emi = P * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
  const total = emi * n;
  showResult("emiResult", "📊 EMI Result", [
    [formatPrice(Math.round(emi)),    "Monthly EMI"],
    [formatPrice(Math.round(total)),  "Total Payment"],
    [formatPrice(Math.round(total-P)),"Total Interest"],
    [formatPrice(P),                  "Principal"]
  ]);
};

window.calcStamp = function() {
  const val = +document.getElementById("stampValue").value;
  if (!val) return alert("Enter property value.");
  const rate = document.getElementById("stampType").value === "agriculture" ? 0.05 : 0.07;
  const reg  = Math.min(val * 0.01, 40000);
  showResult("stampResult", "📜 TN Stamp Duty Estimate", [
    [formatPrice(Math.round(val*rate)),       `Stamp Duty (${(rate*100).toFixed(0)}%)`],
    [formatPrice(Math.round(reg)),            "Registration Fee"],
    [formatPrice(Math.round(val*rate + reg)), "Total Cost"]
  ], "⚠️ Estimated. Verify at your local sub-registrar office.");
};

window.calcRental = function() {
  const val  = +document.getElementById("rentalValue").value;
  const rent = +document.getElementById("rentalRent").value;
  const maint= +document.getElementById("rentalMaint").value || 0;
  if (!val||!rent) return alert("Fill property value and monthly rent.");
  const ann = rent * 12, net = ann - maint;
  showResult("rentalResult", "🏘️ Rental Yield", [
    [(ann/val*100).toFixed(2)+"%", "Gross Yield"],
    [(net/val*100).toFixed(2)+"%", "Net Yield"],
    [formatPrice(Math.round(ann)), "Annual Income"],
    [(val/net).toFixed(1)+" yrs",  "Break-even"]
  ]);
};

window.calcAppreciation = function() {
  const val  = +document.getElementById("appValue").value;
  const rate = +document.getElementById("appRate").value / 100;
  const yrs  = +document.getElementById("appYears").value;
  if (!val||!rate||!yrs) return alert("Fill all fields.");
  const fut = val * Math.pow(1+rate, yrs);
  showResult("appResult", "📈 Property Appreciation", [
    [formatPrice(Math.round(fut)),        `Value in ${yrs} yrs`],
    [formatPrice(Math.round(fut - val)),  "Expected Gain"],
    [(rate*100).toFixed(1)+"%",           "Growth p.a."],
    [((fut-val)/val*100).toFixed(0)+"%",  "Total Return"]
  ]);
};

/* ── POST PROPERTY ── */
window.submitProperty = async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector(".btn-submit");
  btn.textContent = "⏳ Submitting...";
  btn.disabled    = true;

  const payload = {
    title:       document.getElementById("propTitle").value.trim(),
    type:        document.getElementById("propType").value,
    district:    document.getElementById("propDistrict").value,
    area:        document.getElementById("propArea").value.trim(),
    price:       parseFloat(document.getElementById("propPrice").value) || 0,
    size:        document.getElementById("propSize").value.trim(),
    description: document.getElementById("propDesc").value.trim(),
    photo_url:   document.getElementById("propPhoto").value.trim(),
    phone:       document.getElementById("ownerPhone").value.replace(/\D/g, ""),
    owner_name:  document.getElementById("ownerName").value.trim(),
    status:      "pending"
  };

  try {
    const { error } = await supabase.from("properties").insert([payload]);
    if (error) throw error;
  } catch(err) {
    alert("❌ Submission failed: " + err.message);
    btn.textContent = "🚀 Submit Property Listing";
    btn.disabled = false;
    return;
  }

  document.getElementById("postForm").style.display    = "none";
  document.getElementById("postSuccess").style.display = "block";
  document.getElementById("postSuccess").scrollIntoView({ behavior:"smooth" });
};

/* ── HAMBURGER & SCROLL ── */
document.getElementById("hamburger").addEventListener("click", () =>
  document.getElementById("mobileNav").classList.toggle("open"));
document.querySelectorAll(".mobile-nav a").forEach(a =>
  a.addEventListener("click", () =>
    document.getElementById("mobileNav").classList.remove("open")));
window.addEventListener("scroll", () => {
  document.getElementById("header").style.boxShadow =
    window.scrollY > 10 ? "0 4px 24px rgba(0,0,0,0.4)" : "none";
});
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") window.filterProperties();
});

/* ── BOOT ── */
loadProperties();
