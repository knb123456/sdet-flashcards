let allFlashcards = [];
let filteredFlashcards = [];
let index = 0;

// Elements
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const changeLink = document.getElementById('changeTopicsLink');

// Fetch flashcards from API
fetch('http://localhost:3000/flashcards')
  .then(response => response.json())
  .then(data => {
    allFlashcards = data;
    buildTopicSelection();
    loadSavedTopics();
  })
  .catch(error => {
    questionEl.textContent = 'Error loading flashcards.';
    console.error('Error loading flashcards:', error);
  });

// Build topic selection UI
function buildTopicSelection() {
  const topics = [...new Set(allFlashcards.map(card => card.topic))];
  const topicDiv = document.getElementById('topicSelection') || createTopicDiv();
  topicDiv.innerHTML = '<p>Select Topics:</p>';

  topics.forEach(topic => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = topic;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + topic));
    topicDiv.appendChild(label);
    topicDiv.appendChild(document.createElement('br'));
  });

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Topics';
  applyButton.addEventListener('click', saveTopics);
  topicDiv.appendChild(applyButton);
}

// Create topic selection div if missing (for older HTML)
function createTopicDiv() {
  const div = document.createElement('div');
  div.id = 'topicSelection';
  document.body.insertBefore(div, document.querySelector('.card'));
  return div;
}

// Save selected topics and filter flashcards
function saveTopics() {
  const checkboxes = document.querySelectorAll('#topicSelection input[type=checkbox]');
  const selectedTopics = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
  document.getElementById('topicSelection').style.display = 'none';
  toggleControls(true);
  filterFlashcards(selectedTopics);
}

// Load topics from localStorage or show selection
function loadSavedTopics() {
  const saved = localStorage.getItem('selectedTopics');
  if (saved) {
    const selectedTopics = JSON.parse(saved);
    filterFlashcards(selectedTopics);
    document.getElementById('topicSelection').style.display = 'none';
    toggleControls(true);
  } else {
    document.getElementById('topicSelection').style.display = 'block';
    clearFlashcardDisplay();
    toggleControls(false);
  }
}

// Filter flashcards by topic and shuffle
function filterFlashcards(selectedTopics) {
  filteredFlashcards = allFlashcards.filter(card => selectedTopics.includes(card.topic));

  if (filteredFlashcards.length === 0) {
    questionEl.textContent = 'No flashcards for selected topics.';
    answerEl.textContent = '';
    answerEl.style.display = 'none';
  } else {
    shuffleArray(filteredFlashcards);
    index = 0;
    showCard();
  }
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Show current card
function showCard() {
  if (filteredFlashcards.length === 0) return;
  const card = filteredFlashcards[index];
  questionEl.textContent = card.question;
  answerEl.textContent = card.answer;
  answerEl.style.display = 'none';
}

// Clear flashcard display
function clearFlashcardDisplay() {
  questionEl.textContent = '';
  answerEl.textContent = '';
  answerEl.style.display = 'none';
}

// Show/hide flashcard controls
function toggleControls(show) {
  const flashcardContainer = document.getElementById('flashcardContainer');
  flashcardContainer.style.display = show ? 'block' : 'none';
}


// Button listeners
showAnswerBtn.addEventListener('click', () => {
  answerEl.style.display = 'block';
});

nextBtn.addEventListener('click', () => {
  if (filteredFlashcards.length === 0) return;
  index = (index + 1) % filteredFlashcards.length;
  showCard();
});

prevBtn.addEventListener('click', () => {
  if (filteredFlashcards.length === 0) return;
  index = (index - 1 + filteredFlashcards.length) % filteredFlashcards.length;
  showCard();
});

// Change topics link
if (changeLink) {
  changeLink.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('topicSelection').style.display = 'block';
    clearFlashcardDisplay();
    toggleControls(false);
  });
}
