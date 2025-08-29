// Path to the flashcards.json file on GitHub Pages
const jsonUrl = 'flashcards.json';

let flashcards = [];
let currentCardIndex = 0;

const filterToggleBtn = document.getElementById("filterToggleBtn");
const filterContainer = document.getElementById("filterContainer");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const controlsEl = document.querySelector(".controls"); // All 3 buttons are inside this

filterToggleBtn.addEventListener("click", () => {
  const isFilterVisible = filterContainer.style.display === "flex";

  // Toggle filter container
  filterContainer.style.display = isFilterVisible ? "none" : "flex";

  // Toggle visibility of question, answer, and controls
  questionEl.classList.toggle("hidden", !isFilterVisible);
  answerEl.classList.toggle("hidden", !isFilterVisible);
  controlsEl.classList.toggle("hidden", !isFilterVisible);

  // Update button text
  filterToggleBtn.innerText = isFilterVisible ? "Topics" : "Back to Questions";
});


// Shuffle helper (randomize once on load)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function populateTopics() {
  const container = document.getElementById('topicCheckboxes');

  // Clear previous contents to avoid duplicates
  container.innerHTML = '';

  const uniqueTopics = [...new Set(flashcards.map(card => card.topic))].sort();

  // All Topics checkbox
  container.appendChild(createCheckbox('allTopics', 'All Topics', false));
  container.appendChild(document.createElement('br'));

  uniqueTopics.forEach(topic => {
    container.appendChild(createCheckbox(`topic-${topic}`, topic, false, topic));
    container.appendChild(document.createElement('br'));
  });

  // Default checked topics
  const defaultTopics = ['Playwright', 'Playwright-TS', 'Test Automation Frameworks'];
  let matched = false;
  defaultTopics.forEach(topic => {
    const cb = document.getElementById(`topic-${topic}`);
    if (cb) {
      cb.checked = true;
      matched = true;
    }
  });

  // Fallback: if none of the defaults exist, keep All Topics checked
  if (!matched) document.getElementById('allTopics').checked = true;

  container.addEventListener('change', handleTopicChange);
}

function createCheckbox(id, labelText, checked = false, value = null) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.className = id !== 'allTopics' ? 'topicCheckbox' : '';
  checkbox.value = value ?? '';
  checkbox.checked = checked;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;

  const fragment = document.createDocumentFragment();
  fragment.appendChild(checkbox);
  fragment.appendChild(label);
  return fragment;
}

function handleTopicChange(e) {
  const allCb = document.getElementById('allTopics');
  if (e.target.id === 'allTopics') {
    if (e.target.checked) {
      document.querySelectorAll('.topicCheckbox').forEach(cb => cb.checked = false);
    }
  } else {
    const anyChecked = document.querySelectorAll('.topicCheckbox:checked').length > 0;
    allCb.checked = !anyChecked;
  }
  currentCardIndex = 0;
  showCard(0);
}

function getFilteredFlashcards() {
  if (document.getElementById('allTopics').checked) return flashcards;

  const selectedTopics = Array.from(document.querySelectorAll('.topicCheckbox:checked'))
    .map(cb => cb.value);

  return flashcards.filter(card => selectedTopics.includes(card.topic));
}

// Show a specific flashcard
function showCard(index) {
  const filtered = getFilteredFlashcards();

  const questionEl = document.getElementById('question');
  const answerEl = document.getElementById('answer');

  if (filtered.length === 0) {
    questionEl.textContent = 'No flashcards available.';
    answerEl.textContent = '';
    return;
  }

  currentCardIndex = (index + filtered.length) % filtered.length;
  const card = filtered[currentCardIndex];

  questionEl.textContent = card.question;
  answerEl.innerHTML = card.answer.replace(/\n/g, '<br>');
  answerEl.style.display = 'none';
}

document.getElementById('prevBtn').addEventListener('click', () => showCard(currentCardIndex - 1));
document.getElementById('nextBtn').addEventListener('click', () => showCard(currentCardIndex + 1));
document.getElementById('showAnswerBtn').addEventListener('click', () => {
  document.getElementById('answer').style.display = 'block';
});

// Load flashcards on page load
document.addEventListener('DOMContentLoaded', () => {
  fetch(jsonUrl)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load flashcards.');
      return res.json();
    })
    .then(data => {
      flashcards = shuffle(data);
      populateTopics();
      showCard(0);
    })
    .catch(err => alert('Error: ' + err.message));
});
