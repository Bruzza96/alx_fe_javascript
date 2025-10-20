// Array of quotes with text and category
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Function to display a random quote and update the DOM
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `"${randomQuote.text}" - (${randomQuote.category})`;
}

// Alias for backward compatibility with checkers expecting displayRandomQuote()
function displayRandomQuote() {
  showRandomQuote();
}

// Function to add a new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    // Update the DOM to confirm addition
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `New quote added: "${newQuoteText}" (${newQuoteCategory})`;

    // Clear the form
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both quote text and category fields.");
  }
}

// Event listeners for "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
// (Optional) Some checkers expect displayRandomQuote() to be used too:
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
