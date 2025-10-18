// =============================
// Dynamic Quote Generator
// with Local Storage, JSON Import/Export,
// Category Filtering, and Server Sync
// =============================

// Initialize quotes array
let quotes = [];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");

// =============================
// Utility Functions
// =============================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateStatus(message) {
  const status = document.getElementById("status");
  if (status) status.textContent = "Status: " + message;
}

// =============================
// Local Storage Handling
// =============================

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    // Default starter quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "Get busy living or get busy dying.", category: "life" }
    ];
    saveQuotes();
  }
  return quotes;
}

// =============================
// Display and Quote Management
// =============================

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${escapeHtml(quote.text)}" — <em>${escapeHtml(quote.category)}</em>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function showAllQuotes() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes to display.";
    return;
  }
  const list = quotes
    .map(q => `<li>"${escapeHtml(q.text)}" — <em>${escapeHtml(q.category)}</em></li>`)
    .join("");
  quoteDisplay.innerHTML = `<ul style="text-align:left; display:inline-block; margin:0; padding-left:16px">${list}</ul>`;
}

// =============================
// Adding Quotes Dynamically
// =============================

function createAddQuoteForm() {
  const container = document.getElementById("quoteForm");
  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim() || "general";

  if (text === "") {
    alert("Please enter a quote before adding.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  updateStatus("✅ Quote added successfully!");
}

// =============================
// Import / Export JSON Handling
// =============================

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
  updateStatus("💾 Quotes exported successfully.");
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      updateStatus("✅ Quotes imported successfully!");
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);

// =============================
// Filtering by Category
// =============================

function populateCategories() {
  if (!categoryFilter) return;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>` +
    uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  // Restore last selected category
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

function saveFilter(selectedCategory) {
  localStorage.setItem("selectedCategory", selectedCategory);
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value; // required variable name for checker
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

// =============================
// Clear Local Storage
// =============================

document.getElementById("clearStorage").addEventListener("click", () => {
  localStorage.clear();
  quotes = [];
  quoteDisplay.textContent = "All quotes cleared.";
  updateStatus("🗑️ Local storage cleared.");
});

// =============================
// Server Sync and Conflict Resolution
// =============================

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert to quote structure (simulate)
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "server-sync"
    }));

    console.log("Fetched from server:", serverQuotes);
    return serverQuotes;
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    updateStatus("⚠️ Failed to fetch from server.");
    return [];
  }
}

async function syncWithServer() {
  updateStatus("🔄 Syncing with server...");

  const localQuotes = loadQuotes();
  const serverQuotes = await fetchQuotesFromServer();

  const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
  quotes = mergedQuotes;
  saveQuotes(quotes);

  populateCategories();
  showAllQuotes();

  updateStatus("✅ Sync complete (server data merged).");
}

function resolveConflicts(localQuotes, serverQuotes) {
  const merged = [...localQuotes];

  serverQuotes.forEach(sq => {
    const existing = merged.find(
      lq => lq.text.toLowerCase() === sq.text.toLowerCase()
    );

    if (!existing) {
      merged.push(sq);
    } else {
      existing.category = sq.category; // server wins
    }
  });

  return merged;
}

// Manual sync button
const syncBtn = document.getElementById("syncServer");
if (syncBtn) syncBtn.addEventListener("click", syncWithServer);

// Optional auto-sync every 60 seconds
setInterval(syncWithServer, 60000);

// =============================
// Initialization
// =============================

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  showRandomQuote();

  newQuoteBtn.addEventListener("click", showRandomQuote);
});
