
const pages = ["dashboard", "writer", "history", "settings"];
const pageTitles = {
  dashboard: "Dashboard",
  writer: "AI Writer",
  history: "Content History",
  settings: "Settings"
};

const $ = (id) => document.getElementById(id);
let currentDraft = null;
let toastTimer;

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem("contentcraft-drafts") || "[]");
  } catch {
    return [];
  }
}

function setDrafts(drafts) {
  localStorage.setItem("contentcraft-drafts", JSON.stringify(drafts));
  updateDraftCount();
}

function updateDraftCount() {
  const count = getDrafts().length;
  $("draftCount").textContent = `${count} draft${count === 1 ? "" : "s"}`;
}

function showPage(page) {
  if (!pages.includes(page)) return;

  pages.forEach((name) => $(name).classList.toggle("hidden", name !== page));

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.classList.contains("nav") && button.dataset.page === page
    );
  });

  $("breadcrumb").textContent = pageTitles[page];

  if (page === "history") renderHistory();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    const format = button.dataset.format;
    if (format) $("contentType").value = format;
    showPage(button.dataset.page);
  });
});

function makeSampleDraft(topic, type, audience, tone, length) {
  const title = topic.trim();
  const reader = audience.trim() || "readers";
  const intro = `${title} is a useful topic to explore, especially for ${reader}. Understanding the basics can help us make better-informed decisions.`;

  if (type === "Instagram Caption") {
    return `✨ Let's talk about ${title}!\n\n${intro}\n\nWhat do you think? Share your thoughts below! 👇\n\n#${title.replace(/[^a-z0-9]/gi, "")} #Learning #DailyInspiration`;
  }

  if (type === "LinkedIn Post") {
    return `${title}\n\n${intro}\n\nHere are three points worth considering:\n\n1. Understand the fundamentals.\n2. Explore practical examples.\n3. Apply what you learn to real situations.\n\nWhat has your experience been with this topic?`;
  }

  if (type === "Facebook Post") {
    return `Have you thought about ${title}?\n\n${intro}\n\nLet's share ideas and learn from one another. What would you add to this conversation?`;
  }

  const detail = length === "Short"
    ? "Start by learning the core concepts and identifying practical examples. Take one small step at a time."
    : length === "Long"
      ? `\n\n## Why it matters\nLearning about ${title} can help people understand new possibilities and make more informed choices.\n\n## Practical steps\n- Begin with the fundamentals.\n- Explore examples relevant to your daily life.\n- Practice what you learn.\n- Review your progress and identify areas for improvement.\n\n## Common considerations\nThe best approach depends on your goals, available resources, and experience. Verify important claims with reliable sources before relying on them.`
      : `\n\n## Key points\n- Understand the main concepts.\n- Explore practical examples.\n- Identify useful applications.\n\n## How to get started\nBegin with the basics, practice regularly, and review what works best for your situation.`;

  return `# ${title}\n\n## Introduction\n${intro}\n${detail}\n\n## Conclusion\nLearning about ${title} is a starting point for further exploration. Continue researching, asking questions, and applying what you learn.`;
}

$("writerForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const topic = $("topic").value.trim();

  if (!topic) {
    $("topic").focus();
    notify("Please enter a topic first.");
    return;
  }

  const draft = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    topic,
    type: $("contentType").value,
    audience: $("audience").value.trim(),
    tone: $("tone").value,
    length: $("length").value,
    text: makeSampleDraft(
      topic,
      $("contentType").value,
      $("audience").value,
      $("tone").value,
      $("length").value
    ),
    createdAt: new Date().toISOString()
  };

  currentDraft = draft;
  $("outputText").value = draft.text;
  $("outputSubtitle").textContent = `${draft.type} · ${draft.tone} tone`;
  $("emptyOutput").classList.add("hidden");
  $("outputArea").classList.remove("hidden");

  notify("Sample draft prepared!");
});

$("copyButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("outputText").value);
    notify("Draft copied!");
  } catch {
    $("outputText").select();
    notify("Select the text and press Ctrl+C.");
  }
});

$("downloadButton").addEventListener("click", () => {
  const blob = new Blob([$("outputText").value], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(currentDraft?.topic || "draft")
    .replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  notify("Download started!");
});

$("saveButton").addEventListener("click", () => {
  if (!currentDraft) return;

  const drafts = getDrafts();
  const updated = {
    ...currentDraft,
    text: $("outputText").value,
    updatedAt: new Date().toISOString()
  };

  const index = drafts.findIndex((item) => item.id === updated.id);

  if (index >= 0) drafts[index] = updated;
  else drafts.unshift(updated);

  try {
    setDrafts(drafts);
    currentDraft = updated;
    notify("Draft saved in this browser!");
  } catch {
    notify("Storage is full. Remove old drafts and try again.");
  }
});

function renderHistory() {
  const list = $("historyList");
  list.replaceChildren();

  const drafts = getDrafts();

  if (!drafts.length) {
    const empty = document.createElement("p");
    empty.textContent = "No saved drafts yet. Create and save your first draft.";
    list.appendChild(empty);
    return;
  }

  drafts.forEach((draft) => {
    const card = document.createElement("article");
    card.className = "history-item";

    const title = document.createElement("h3");
    title.textContent = draft.topic;

    const meta = document.createElement("small");
    meta.textContent = `${draft.type} · ${new Date(draft.updatedAt || draft.createdAt).toLocaleString()}`;

    const preview = document.createElement("p");
    preview.textContent = draft.text.slice(0, 180) + (draft.text.length > 180 ? "..." : "");

    const open = document.createElement("button");
    open.className = "secondary-button";
    open.textContent = "Open draft";

    open.addEventListener("click", () => {
      currentDraft = draft;
      $("contentType").value = draft.type;
      $("topic").value = draft.topic;
      $("audience").value = draft.audience;
      $("tone").value = draft.tone;
      $("length").value = draft.length;
      $("outputText").value = draft.text;
      $("outputSubtitle").textContent = `${draft.type} · ${draft.tone} tone`;
      $("emptyOutput").classList.add("hidden");
      $("outputArea").classList.remove("hidden");
      showPage("writer");
    });

    card.append(title, meta, preview, open);
    list.appendChild(card);
  });
}

$("clearHistory").addEventListener("click", () => {
  if (!confirm("Delete all saved drafts from this browser?")) return;

  setDrafts([]);
  renderHistory();
  notify("Saved drafts cleared.");
});

$("saveSettings").addEventListener("click", () => {
  try {
    localStorage.setItem("contentcraft-settings", JSON.stringify({
      tone: $("defaultTone").value,
      audience: $("defaultAudience").value.trim()
    }));

    $("tone").value = $("defaultTone").value;
    $("audience").value = $("defaultAudience").value.trim();
    $("settingsMessage").textContent = "Preferences saved in this browser.";
    notify("Preferences saved!");
  } catch {
    notify("Could not save preferences.");
  }
});

try {
  const settings = JSON.parse(localStorage.getItem("contentcraft-settings") || "null");

  if (settings) {
    $("defaultTone").value = settings.tone || "Professional";
    $("defaultAudience").value = settings.audience || "";
    $("tone").value = settings.tone || "Professional";
    $("audience").value = settings.audience || "";
  }
} catch {
  // Use the default preferences.
}

updateDraftCount();
showPage("dashboard");
