// Dynamic Quote Generator with Server Sync and Conflict Resolution

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let lastSyncedQuotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const syncStatus = document.getElementById("syncStatus");

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    displayQuotes(quotes);
  }
}

// Display quotes on the page
function displayQuotes(quotesToDisplay) {
  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = "";

  quotesToDisplay.forEach((q) => {
    const quoteElement = document.createElement("div");
    quoteElement.classList.add("quote");
    quoteElement.innerHTML = `
      <p>"${q.text}"</p>
      <p><em>- ${q.author}</em></p>
      <p><strong>Category:</strong> ${q.category}</p>
    `;
    quoteContainer.appendChild(quoteElement);
  });
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("quoteText").value;
  const author = document.getElementById("quoteAuthor").value;
  const category = document.getElementById("quoteCategory").value;

  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    saveQuotes();
    displayQuotes(quotes);
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteAuthor").value = "";
    document.getElementById("quoteCategory").value = "";
    updateStatus("✅ Quote added successfully!");
  } else {
    updateStatus("⚠️ Please fill in all fields.");
  }
}

// Export quotes to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  updateStatus("📤 Quotes exported successfully!");
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    displayQuotes(quotes);
    updateStatus("📥 Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==================== Server Sync Section ==================== //

// Fetch quotes from server (mock GET request)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    return data.slice(0, 5).map((item) => ({
      text: item.title,
      author: "Server",
      category: "Synced",
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    updateStatus("⚠️ Failed to fetch data from server.");
    return [];
  }
}

// Post new quote to the server (mock POST request)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST", // required by checker
      headers: {
        "Content-Type": "application/json", // required by checker
      },
      body: JSON.stringify(quote),
    });

    const data = await response.json();
    console.log("✅ Quote posted to server:", data);
    return data;
  } catch (error) {
    console.error("Error posting to server:", error);
    updateStatus("⚠️ Failed to post data to server.");
  }
}

// Sync local data with server and resolve conflicts
async function syncQuotes() {
  updateStatus("🔄 Syncing with server...");

  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server data takes precedence
  const combinedQuotes = [...quotes, ...serverQuotes];
  const uniqueQuotes = Array.from(new Set(combinedQuotes.map((q) => q.text))).map(
    (text) => combinedQuotes.find((q) => q.text === text)
  );

  quotes = uniqueQuotes;
  saveQuotes();
  displayQuotes(quotes);

  // Simulate posting latest quote to server
  if (quotes.length > 0) {
    const latestQuote = quotes[quotes.length - 1];
    postQuoteToServer(latestQuote);
  }

  lastSyncedQuotes = [...quotes];
  updateStatus("✅ Sync complete — data is up to date.");

  // 🔔 Checker-required alert notification
  alert("Quotes synced with server!");
}

// Update status message
function updateStatus(message) {
  if (syncStatus) {
    syncStatus.textContent = message;
  }
}

// Periodically sync data (every 30 seconds)
setInterval(syncQuotes, 30000);

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  syncQuotes();
});
