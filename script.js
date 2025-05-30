let allFlashcards = [];
let filteredFlashcards = [];
let index = 0;

// Fetch flashcards and build topic selection
fetch('flashcards.csv')
  .then(response => response.text())
  .then(data => {
    const lines = data.split('\n').slice(1); // Skip header
    allFlashcards = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const [topic, question, answer] = line.split(',');
        return {
          topic: topic.trim(),
          question: question.trim(),
          answer: answer.trim()
        };
      });
    buildTopicSelection();
    loadSavedTopics();
  })
  .catch(error => {
    document.getElementById('question').textContent = 'Error loading flashcards.';
    console.error('Error loading flashcards:', error);
  });

// Build topic checkboxes
function buildTopicSelection() {
  const topics = [...new Set(allFlashcards.map(card => card.topic))];
  const topicDiv = document.getElementById('topicSelection');
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

// Save selected topics to localStorage and filter flashcards
function saveTopics() {
  const checkboxes = document.querySelectorAll('#topicSelection input[type=checkbox]');
  const selectedTopics = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
  document.getElementById('topicSelection').style.display = 'none';
  filterFlashcards(selectedTopics);
}

// Load saved topics from localStorage
function loadSavedTopics() {
  const saved = localStorage.getItem('selectedTopics');
  if (saved) {
    const selectedTopics = JSON.parse(saved);
    filterFlashcards(selectedTopics);
    document.getElementById('topicSelection').style.display = 'none';
  } else {
    document.getElementById('topicSelection').style.display = 'block';
  }
}

// Filter flashcards by selected topics and shuffle
function filterFlashcards(selectedTopics) {
  filteredFlashcards = allFlashcards.filter(card => selectedTopics.includes(card.topic));

  if (filteredFlashcards.length === 0) {
    document.getElementById('question').textContent = 'No flashcards for selected topics.';
    document.getElementById('answer').textContent = '';
  } else {
    shuffleArray(filteredFlashcards);
    index = 0;
    showCard();
  }
}

// Shuffle array using Fisher-Yates
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showCard() {
  if (filteredFlashcards.length === 0) return;
  const card = filteredFlashcards[index];
  document.getElementById('question').textContent = card.question;
  document.getElementById('answer').textContent = card.answer;
  document.getElementById('answer').style.display = 'none';
}

document.getElementById('showAnswerBtn').addEventListener('click', function () {
  document.getElementById('answer').style.display = 'block';
});

document.getElementById('nextBtn').addEventListener('click', function () {
  if (filteredFlashcards.length === 0) return;
  index = (index + 1) % filteredFlashcards.length;
  showCard();
});

document.getElementById('prevBtn').addEventListener('click', function () {
  if (filteredFlashcards.length === 0) return;
  index = (index - 1 + filteredFlashcards.length) % filteredFlashcards.length;
  showCard();
});

// Change Topics link
document.getElementById('changeTopicsLink').addEventListener('click', function () {
  document.getElementById('topicSelection').style.display = 'block';
});