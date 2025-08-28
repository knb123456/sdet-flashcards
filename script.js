// Path to the flashcards.json file on GitHub Pages
const jsonUrl = 'flashcards.json'; // Adjust if your file is in a subfolder

let flashcards = [];
let currentCardIndex = 0;
let currentTopic = 'All';
let topicsInitialized = false; // prevent duplicate listeners

// Toggle filter panel
document.getElementById("filterToggleBtn").addEventListener("click", () => {
  const filterContainer = document.getElementById("filterContainer");
  filterContainer.style.display =
    filterContainer.style.display === "none" || filterContainer.style.display === ""
      ? "flex"
      : "none";
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

  const topics = [...new Set(flashcards.map(card => card.topic))].sort();

  // Add "All Topics" checkbox (start unchecked now)
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = 'allTopics';
  allCheckbox.checked = false; // 👈 don't auto-select All

  const allLabel = document.createElement('label');
  allLabel.htmlFor = 'allTopics';
  allLabel.textContent = 'All Topics';

  container.appendChild(allCheckbox);
  container.appendChild(allLabel);
  container.appendChild(document.createElement('br'));

  // Add individual topic checkboxes
  topics.forEach(topic => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = topic;
    checkbox.className = 'topicCheckbox';
    checkbox.id = `topic-${topic}`;

    const label = document.createElement('label');
    label.htmlFor = `topic-${topic}`;
    label.textContent = topic;

    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });

// ✅ Default selected topics
const defaultTopics = ['JavaScript', 'TypeScript', 'Playwright-TS'];

let matched = false;
defaultTopics.forEach(topic => {
  const cb = document.getElementById(`topic-${topic}`);
  if (cb) {
    cb.checked = true;
    matched = true;
  }
});

// Fallback: if none of the defaults exist, keep All Topics checked
if (!matched) {
  allCheckbox.checked = true;
}

  // Attach the change listener only once
  if (!topicsInitialized) {
    container.addEventListener('change', (e) => {
      const target = e.target;

      if (target.id === 'allTopics') {
        if (target.checked) {
          document.querySelectorAll('.topicCheckbox').forEach(cb => cb.checked = false);
        }
      } else {
        const anyChecked = Array.from(document.querySelectorAll('.topicCheckbox'))
          .some(cb => cb.checked);
        document.getElementById('allTopics').checked = !anyChecked;
      }

      currentCardIndex = 0;
      showCard(0);
    });
    topicsInitialized = true;
  }
}

function getFilteredFlashcards() {
  const allChecked = document.getElementById('allTopics').checked;
  if (allChecked) return flashcards;

  const selectedTopics = Array.from(document.querySelectorAll('.topicCheckbox:checked'))
    .map(cb => cb.value);

  return flashcards.filter(card => selectedTopics.includes(card.topic));
}

// Show a specific flashcard
function showCard(index) {
  const filteredCards = getFilteredFlashcards();
  if (filteredCards.length === 0) {
    document.getElementById('question').textContent = 'No flashcards available.';
    document.getElementById('answer').textContent = '';
    return;
  }

  currentCardIndex = (index + filteredCards.length) % filteredCards.length;
  const card = filteredCards[currentCardIndex];

  document.getElementById('question').textContent = card.question;
  // Convert \n into line breaks
  const formattedAnswer = card.answer.replace(/\n/g, '<br>');
  document.getElementById('answer').innerHTML = formattedAnswer;
  document.getElementById('answer').style.display = 'none';
}

// Navigation
document.getElementById('prevBtn').addEventListener('click', () => {
  showCard(currentCardIndex - 1);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  showCard(currentCardIndex + 1);
});

// Show answer
document.getElementById('showAnswerBtn').addEventListener('click', () => {
  document.getElementById('answer').style.display = 'block';
});

// Load flashcards on page load (single block)
document.addEventListener('DOMContentLoaded', () => {
  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load flashcards.');
      return response.json();
    })
    .then(data => {
      flashcards = shuffle(data); // 🔀 randomize once
      populateTopics();
      showCard(0);
    })
    .catch(err => {
      alert('Error: ' + err.message);
    });
});
