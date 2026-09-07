const PROMPTS = {
  warm: [
    "What’s one small thing that made you smile this week?",
    "What song has been in heavy rotation for you lately?",
    "What’s your ideal slow Saturday in Los Angeles?",
    "What’s a tiny luxury you swear by?",
    "What could you talk about for ten minutes with zero preparation?",
    "What food always feels like comfort?",
    "What’s a hobby you’re curious to try?",
    "What’s a recent win—no matter how small?",
    "What’s one local spot you want more people to know about?",
    "What’s something you’re looking forward to this season?",
    "What makes a gathering instantly feel welcoming to you?",
    "What does your current main-character soundtrack sound like?"
  ],
  connect: [
    "What kind of friendship are you making more room for?",
    "When do you feel most like yourself?",
    "What makes you feel truly seen in a friendship?",
    "What boundary has made your life better?",
    "What tradition would you love to start with friends?",
    "What’s a piece of advice from another Black woman that stayed with you?",
    "What does feeling supported look like for you right now?",
    "What’s something you wish more Black women talked about openly?",
    "Who is a Black woman—personally or publicly—whose work inspires you, and why?",
    "What’s something you’re learning to give yourself more grace around?",
    "What helps you come back to yourself after a hard week?",
    "What’s something you want to be celebrated for more?"
  ],
  dream: [
    "If time and money were handled, what would you create or explore?",
    "What’s one goal you’d love gentle accountability around?",
    "What would your dream girls’ day in Los Angeles include?",
    "What skill, resource, or connection could you share with someone here?",
    "What’s one way community could make this season lighter?",
    "What kind of gathering should Brown Sugar Circle host next?",
    "What are you saying yes to more often?",
    "Where do you hope life feels different a year from now?",
    "What would a nourishing Black women’s community feel like to you?",
    "What brave next step are you considering?",
    "What are you proud of yourself for right now?",
    "What do you hope another woman leaves this picnic feeling?"
  ]
};

const CATEGORY_INFO = {
  warm: { label: "Warm up", color: "#e3ba59", note: "Take turns around the circle—or pass." },
  connect: { label: "Build connection", color: "#fae1ca", note: "Listen for what resonates. Advice only by invitation." },
  dream: { label: "Dream together", color: "#f2a039", note: "Leave room for possibility—there are no small dreams." }
};

let deck = [];
let currentIndex = 0;
let currentPrompt = null;
let assignedGroupNumber = null;
let previousGroupNumber = null;

const GROUP_STORAGE_KEY = "bsc-picnic-group";
const PREVIOUS_GROUP_STORAGE_KEY = "bsc-previous-picnic-group";

const screens = [...document.querySelectorAll("[data-screen]")];
const app = document.getElementById("app");
const activeCard = document.getElementById("activeCard");
const promptText = document.getElementById("promptText");
const categoryLabel = document.getElementById("categoryLabel");
const cardNumber = document.getElementById("cardNumber");
const roundLabel = document.getElementById("roundLabel");
const progressLabel = document.getElementById("progressLabel");
const promptNote = document.getElementById("promptNote");
const nextCardButton = document.getElementById("nextCardButton");
const toast = document.getElementById("toast");
const groupNumber = document.getElementById("groupNumber");
const groupTitle = document.getElementById("group-title");
const groupIntro = document.getElementById("groupIntro");
const groupAnnouncement = document.getElementById("groupAnnouncement");
const assignGroupButton = document.getElementById("assignGroupButton");
const continueButton = document.getElementById("continueButton");

function getSavedGroupNumber() {
  try {
    const saved = Number.parseInt(window.localStorage.getItem(GROUP_STORAGE_KEY), 10);
    return saved >= 1 && saved <= 12 ? saved : null;
  } catch (error) {
    return assignedGroupNumber;
  }
}

function saveGroupNumber(number) {
  assignedGroupNumber = number;
  try {
    window.localStorage.setItem(GROUP_STORAGE_KEY, String(number));
  } catch (error) {
    // The assignment still works for this visit if browser storage is unavailable.
  }
}

function getPreviousGroupNumber() {
  try {
    const saved = Number.parseInt(window.localStorage.getItem(PREVIOUS_GROUP_STORAGE_KEY), 10);
    return saved >= 1 && saved <= 12 ? saved : null;
  } catch (error) {
    return previousGroupNumber;
  }
}

function savePreviousGroupNumber(number) {
  previousGroupNumber = number;
  try {
    window.localStorage.setItem(PREVIOUS_GROUP_STORAGE_KEY, String(number));
  } catch (error) {
    // The previous assignment is still remembered for this visit.
  }
}

function renderGroupAssignment() {
  const saved = getSavedGroupNumber();
  groupNumber.textContent = saved ?? "?";
  groupTitle.textContent = saved ? `You’re in Circle ${saved}.` : "Let’s find your circle.";
  groupIntro.textContent = saved
    ? "Find the picnic sign with the same number."
    : "Tap below to pick a number from 1–12.";
  groupAnnouncement.textContent = saved
    ? `You’re in Circle ${saved}. Find the picnic sign with the same number.`
    : "";
  assignGroupButton.hidden = Boolean(saved);
  continueButton.hidden = !saved;
  document.querySelector(".assignment-panel").classList.toggle("has-number", Boolean(saved));
}

function assignGroup() {
  const previous = getPreviousGroupNumber();
  let number = Math.floor(Math.random() * (previous ? 11 : 12)) + 1;
  if (previous && number >= previous) number += 1;
  saveGroupNumber(number);
  renderGroupAssignment();
  groupNumber.classList.remove("is-revealing");
  requestAnimationFrame(() => groupNumber.classList.add("is-revealing"));
  continueButton.focus({ preventScroll: true });
}

function showScreen(name, updateHash = true) {
  screens.forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === name));
  document.querySelector(".page-shell").classList.toggle("is-home", name === "home");
  if (name === "group") renderGroupAssignment();
  if (updateHash) history.replaceState(null, "", name === "home" ? location.pathname : `#${name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(() => app.focus({ preventScroll: true }));
}

function buildShuffledDeck() {
  const cards = Object.entries(PROMPTS).flatMap(([category, prompts]) =>
    prompts.map((prompt) => ({ category, prompt }))
  );
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function drawPrompt(animate = false) {
  if (!deck.length || currentIndex >= deck.length) {
    deck = buildShuffledDeck();
    currentIndex = 0;
  }
  const { category, prompt } = deck[currentIndex];
  const render = () => {
    currentPrompt = prompt;
    const info = CATEGORY_INFO[category];
    promptText.textContent = currentPrompt;
    categoryLabel.textContent = info.label;
    roundLabel.textContent = "Shuffled deck";
    promptNote.textContent = info.note;
    cardNumber.textContent = String(currentIndex + 1).padStart(2, "0");
    progressLabel.textContent = `Card ${currentIndex + 1} of ${deck.length}`;
    activeCard.style.background = info.color;
    nextCardButton.firstChild.textContent = currentIndex === deck.length - 1 ? "Reshuffle deck " : "Draw another card ";
  };

  if (!animate) return render();
  activeCard.classList.add("is-changing");
  window.setTimeout(render, 205);
  window.setTimeout(() => activeCard.classList.remove("is-changing"), 430);
}

function startDeck() {
  deck = buildShuffledDeck();
  currentIndex = 0;
  drawPrompt(false);
  showScreen("deck");
}

function nextPrompt() {
  currentIndex += 1;
  drawPrompt(true);
}

function resetCircle() {
  const currentGroupNumber = getSavedGroupNumber();
  if (currentGroupNumber) savePreviousGroupNumber(currentGroupNumber);
  deck = [];
  currentIndex = 0;
  currentPrompt = null;
  assignedGroupNumber = null;
  try {
    window.localStorage.removeItem(GROUP_STORAGE_KEY);
  } catch (error) {
    // The in-memory assignment is still cleared if browser storage is unavailable.
  }
  showScreen("welcome");
}

async function shareCards() {
  const shareData = {
    title: "Brown Sugar Circle conversation cards",
    text: "Open these Brown Sugar Circle picnic conversation cards for your group.",
    url: `${location.origin}${location.pathname}#welcome`
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Link copied");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Link copied");
    }
  }
}

async function shareHome() {
  const shareData = {
    title: "Brown Sugar Circle",
    text: "A supportive community for Black women in Los Angeles.",
    url: location.origin + location.pathname
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Link copied");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      await navigator.clipboard.writeText(shareData.url);
      showToast("Link copied");
    }
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function celebrate() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const container = document.getElementById("confetti");
    const colors = ["#612717", "#e3ba59", "#b46424", "#fae1ca", "#f2a039"];
    for (let i = 0; i < 36; i += 1) {
      const piece = document.createElement("span");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * .45}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      container.appendChild(piece);
      window.setTimeout(() => piece.remove(), 2300);
    }
  }
  showScreen("done");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) showScreen(routeButton.dataset.route);
});

document.getElementById("beginDeckButton").addEventListener("click", startDeck);
assignGroupButton.addEventListener("click", assignGroup);
nextCardButton.addEventListener("click", nextPrompt);
document.getElementById("finishButton").addEventListener("click", celebrate);
document.getElementById("newCircleButton").addEventListener("click", resetCircle);
document.getElementById("shareButton").addEventListener("click", shareCards);
document.getElementById("doneShareButton").addEventListener("click", shareCards);
document.getElementById("homeShareButton").addEventListener("click", shareHome);

const initialRoute = location.hash.replace("#", "");
if (["welcome", "host", "group", "setup", "icebreaker"].includes(initialRoute)) showScreen(initialRoute, false);
else showScreen("home", false);
