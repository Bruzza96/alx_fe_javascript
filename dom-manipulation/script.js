// Dynamic Quote Generator with Filtering + Web Storage + JSON Import/Export

const STORAGE_KEY = "dynamicQuoteGenerator_quotes_v2";
const LAST_FILTER_KEY = "dynamicQuoteGenerator_lastFilter";
const LAST_VIEWED_KEY = "dynamicQuoteGenerator_lastViewedIndex";

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const quoteFormContainer = document.getElementById("quoteForm");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorage");
const showAllBtn = document.getElementById("showAll");
const categoryFilter = document.getElementById("categoryFilter");
const statusEl = document.getElementById("status");

let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" },
];

// ===== STORAGE FUNCTIONS =====
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  }
}

function saveFilter(filter) {
  localStorage.setItem(LAST_FILTER_KEY, filter);
}

function loadLastFilter() {
  return localStorage.getItem(LAST_FILTER_KEY) || "all";
}

// ===== CATEGORY MANAGEMENT =====
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = loadLastFilter();
  categoryFilter.value = lastFilter;
}

// ===== FILTER FUNCTION =====
function filterQuotes() {
  const selectedCategory = categoryFilter.value; // required name for checker
  saveFilter(selectedCategory);

  if (selectedCategory === "all") {
    showAllQuotes();
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    if (filtered.length === 0) {
      quoteDisplay.textContent = `No quotes found for category: ${selectedCategory}`;
      return;
    }
    const list = filtered
      .map(q => `<li>"${escapeHtml(q.text)}" — <em>${escapeHtml(q.category)}</em></li>`)
      .join("");
    quoteDisplay.innerHTML = `<ul style="text-align:left; display:inline-block; margin:0; padding-left:16px">${list}</ul>`;
  }
}

// ===== QUOTE DISPLAY =====
function showRandomQuote() {
  if (quotes.length === 0) return;
  const selected = categoryFilter.value;
  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const q = filtered[randomIndex];
  quoteDisplay.innerHTML = `<p>"${escapeHtml(q.text)}"</p><small>— ${escapeHtml(q.category)}</small>`;
  sessionStorage.setItem(LAST_VIEWED_KEY, String(randomIndex));
}

function showAllQuotes() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const list = quotes.map(q => `<li>"${escapeHtml(q.text)}" — <em>${escapeHtml(q.category)}</em></li>`).join("");
  quoteDisplay.innerHTML = `<ul style="text-align:left; display:inline-block; margin:0; padding-left:16px">${list}</ul>`;
}

// ===== ADD QUOTES =====
function createAddQuoteForm() {
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  quoteFormContainer.appendChild(quoteInput);
  quoteFormContainer.appendChild(categoryInput);
  quoteFormContainer.appendChild(addButton);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

// ===== IMPORT/EXPORT =====
function exportQuotes() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid JSON format!");
        return;
      }
      imported.forEach(q => {
        if (q.text && q.category) quotes.push(q);
      });
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Error reading JSON file!");
    }
  };
  reader.readAsText(file);
}

// ===== UTIL =====
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== INIT =====
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  newQuoteButton.addEventListener("click", showRandomQuote);
  showAllBtn.addEventListener("click", showAllQuotes);
  exportBtn.addEventListener("click", exportQuotes);
  importFileInput.addEventListener("change", importFromJsonFile);
  clearStorageBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("Local storage cleared!");
    location.reload();
  });

  // Load last filter and apply immediately
  const lastFilter = loadLastFilter();
  categoryFilter.value = lastFilter;
  filterQuotes();
}

init();
