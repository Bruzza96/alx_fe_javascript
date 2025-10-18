// ========== Dynamic Quote Generator with localStorage, sessionStorage, JSON import/export ==========

// Default quotes (used only if nothing is in localStorage)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
];

// Constants for storage keys
const LOCAL_STORAGE_KEY = "dynamicQuoteGenerator.quotes";
const SESSION_LAST_QUOTE_KEY = "dynamicQuoteGenerator.lastQuote";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ---------------- Storage helpers ----------------
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Basic validation: ensure each item has text & category strings
      const valid = parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (valid) {
        quotes = parsed;
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Failed to load/parse quotes from localStorage:", err);
    return false;
  }
}

// Save last viewed quote to sessionStorage (demonstration of sessionStorage)
function saveLastViewedQuoteToSession(quoteText) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, quoteText);
  } catch (err) {
    console.error("Failed to save last quote to sessionStorage:", err);
  }
}

function getLastViewedQuoteFromSession() {
  try {
    return sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
  } catch (err) {
    console.error("Failed to read last quote from sessionStorage:", err);
    return null;
  }
}

// ---------------- Category dropdown population ----------------
function populateCategories() {
  let categorySelect = document.getElementById("categorySelect");

  // If the select isn't present, create it and place before the quoteDisplay
  if (!categorySelect) {
    categorySelect = document.createElement("select");
    categorySelect.id = "categorySelect";

    const label = document.createElement("label");
    label.htmlFor = "categorySelect";
    label.textContent = "Choose a category: ";
    label.style.marginRight = "6px";

    const controlsDiv = document.getElementById("controls") || document.body;
    controlsDiv.insertBefore(label, newQuoteBtn);
    controlsDiv.insertBefore(categorySelect, newQuoteBtn);
  }

  const categories = [...new Set(quotes.map(q => q.category))];

  // Option to view all
  categorySelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "ALL_CATEGORIES";
  allOption.textContent = "All categories";
  categorySelect.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// ---------------- Show a random quote ----------------
function showRandomQuote() {
  const categorySelect = document.getElementById("categorySelect");
  const selected = categorySelect ? categorySelect.value : "ALL_CATEGORIES";

  let filtered;
  if (!categorySelect || selected === "ALL_CATEGORIES") filtered = quotes;
  else filtered = quotes.filter(q => q.category === selected);

  if (!filtered || filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[randomIndex];

  quoteDisplay.textContent = `"${chosen.text}" — ${chosen.category}`;

  // Save last viewed quote in sessionStorage (temporary)
  saveLastViewedQuoteToSession(chosen.text);
}

// --------------- Add quote (used by the form) ----------------
function addQuote() {
  const newQuoteTextElem = document.getElementById("newQuoteText");
  const newQuoteCategoryElem = document.getElementById("newQuoteCategory");

  if (!newQuoteTextElem || !newQuoteCategoryElem) {
    alert("Add-quote form fields not found.");
    return;
  }

  const newQuoteText = newQuoteTextElem.value.trim();
  const newQuoteCategory = newQuoteCategoryElem.value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please fill in both fields!");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotesToLocalStorage();
  populateCategories();
  newQuoteTextElem.value = "";
  newQuoteCategoryElem.value = "";
  alert("New quote added successfully!");
}

// ------------- Required by checker: createAddQuoteForm() -------------
function createAddQuoteForm() {
  // If form already exists, skip
  if (document.getElementById("addQuoteFormContainer")) return;

  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteFormContainer";
  formContainer.style.marginTop = "20px";
  formContainer.style.borderTop = "1px solid #ddd";
  formContainer.style.paddingTop = "12px";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote / Import / Export";
  formContainer.appendChild(title);

  // Quote text input
  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";
  inputQuote.style.marginRight = "8px";
  inputQuote.style.width = "45%";

  // Category input
  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.style.marginRight = "8px";
  inputCategory.style.width = "20%";

  // Add button
  const addButton = document.createElement("button");
  addButton.id = "addQuoteButton";
  addButton.textContent = "Add Quote";
  addButton.style.marginRight = "12px";
  addButton.addEventListener("click", addQuote);

  // Export button
  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes (JSON)";
  exportButton.style.marginRight = "12px";
  exportButton.addEventListener("click", exportQuotesToJsonFile);

  // Import file input
  const importLabel = document.createElement("label");
  importLabel.textContent = " Import JSON: ";
  importLabel.style.marginLeft = "8px";
  importLabel.style.marginRight = "6px";

  const importFileInput = document.createElement("input");
  importFileInput.type = "file";
  importFileInput.accept = ".json,application/json";
  importFileInput.id = "importFile";
  importFileInput.addEventListener("change", importFromJsonFile);

  // Append children
  formContainer.appendChild(inputQuote);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
  formContainer.appendChild(exportButton);
  formContainer.appendChild(importLabel);
  formContainer.appendChild(importFileInput);

  // Append container to body
  document.body.appendChild(formContainer);
}

// ------------- JSON Export -------------
function exportQuotesToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();

    // cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export quotes.");
  }
}

// ------------- JSON Import -------------
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);

      if (!Array.isArray(parsed)) {
        alert("Imported JSON must be an array of quote objects.");
        return;
      }

      // Validate imported objects: must have text & category strings
      const validEntries = parsed.filter(
        item => item && typeof item.text === "string" && typeof item.category === "string"
      );

      if (validEntries.length === 0) {
        alert("Imported file does not contain valid quote objects.");
        return;
      }

      // Append validated entries
      quotes.push(...validEntries);
      saveQuotesToLocalStorage();
      populateCategories();
      alert(`Imported ${validEntries.length} quote(s) successfully!`);
      // Reset file input so same file can be re-imported if needed
      event.target.value = "";
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import JSON file. Ensure it is valid JSON containing an array of {text, category} objects.");
    }
  };

  reader.readAsText(file);
}

// ---------------- Initialization ----------------
function initApp() {
  // Load from localStorage if present
  const loaded = loadQuotesFromLocalStorage();
  if (!loaded) {
    // If nothing in localStorage, save defaults so user starts with persistent copy
    saveQuotesToLocalStorage();
  }

  // Build UI pieces
  populateCategories();
  createAddQuoteForm();

  // show last viewed quote from sessionStorage if present, otherwise random
  const last = getLastViewedQuoteFromSession();
  if (last) {
    quoteDisplay.textContent = `"${last}" (last viewed in this session)`;
  } else {
    showRandomQuote();
  }

  // Event listeners
  if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);
}

// Run app
initApp();
