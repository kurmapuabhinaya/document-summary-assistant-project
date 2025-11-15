const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");
const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const summaryBox = document.getElementById("summaryBox");
const summaryLengthSelect = document.getElementById("summaryLength");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const copySummaryBtn = document.getElementById("copySummaryBtn");

// update live counts
inputText.addEventListener("input", () => {
  const text = inputText.value;
  charCount.textContent = `${text.length} characters`;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCount.textContent = `${words} words`;
});

// handle file upload (.txt)
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type && file.type !== "text/plain") {
    alert("Please upload a .txt file only.");
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    inputText.value = event.target.result;
    inputText.dispatchEvent(new Event("input"));
  };
  reader.readAsText(file);
});

// simple sentence-based summarizer
function generateSummary(text, lengthOption) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return "";

  // split into sentences
  let sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];

  // decide how many sentences for summary
  let fraction;
  if (lengthOption === "short") fraction = 0.2;
  else if (lengthOption === "medium") fraction = 0.35;
  else fraction = 0.5;

  let count = Math.max(1, Math.round(sentences.length * fraction));
  if (count > 7) count = 7; // cap to keep it concise

  // naive score: longer sentences slightly more important
  sentences = sentences.map((s) => s.trim()).filter(Boolean);
  const scored = sentences.map((s, index) => ({
    sentence: s,
    score: s.split(/\s+/).length,
    index,
  }));

  // pick top N by score and preserve original order
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, count).sort((a, b) => a.index - b.index);

  return top.map((item) => item.sentence).join(" ");
}

// click: summarize
summarizeBtn.addEventListener("click", () => {
  const text = inputText.value;
  if (!text.trim()) {
    alert("Please paste some text or upload a file first.");
    return;
  }

  const lengthOption = summaryLengthSelect.value;
  const summary = generateSummary(text, lengthOption);

  summaryBox.innerHTML = "";
  if (summary) {
    const p = document.createElement("p");
    p.textContent = summary;
    summaryBox.appendChild(p);
  } else {
    const p = document.createElement("p");
    p.textContent = "Unable to generate a summary. Please try with more text.";
    p.classList.add("placeholder");
    summaryBox.appendChild(p);
  }
});

// clear
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  summaryBox.innerHTML = '<p class="placeholder">Your summary will appear here.</p>';
  charCount.textContent = "0 characters";
  wordCount.textContent = "0 words";
  fileInput.value = "";
});

// copy summary
copySummaryBtn.addEventListener("click", () => {
  const text = summaryBox.innerText.trim();
  if (!text || text === "Your summary will appear here.") {
    alert("There is no summary to copy yet.");
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => alert("Summary copied to clipboard!"),
    () => alert("Failed to copy summary.")
  );
});
