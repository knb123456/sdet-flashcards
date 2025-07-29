// Path to the flashcards.json file on GitHub Pages
const jsonUrl = 'flashcards.json'; // Adjust if your file is in a subfolder

let flashcards = [];
let currentCardIndex = 0;
let currentTopic = 'All';

// Load flashcards on page load
document.addEventListener('DOMContentLoaded', () => {
  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load flashcards.');
      return response.json();
    })
    .then(data => {
      flashcards = data;
      populateTopics();
      showCard(0);
    })
    .catch(err => {
      alert('Error: ' + err.message);
    });
});

// Populate topic dropdown
function populateTopics() {
  const topicFilter = document.getElementById('topicFilter');
  const topics = [...new Set(flashcards.map(card => card.topic))];
  topics.sort();

  topicFilter.innerHTML = '<option value="All">All Topics</option>';
  topics.forEach(topic => {
    const option = document.createElement('option');
    option.value = topic;
    option.textContent = topic;
    topicFilter.appendChild(option);
  });

  topicFilter.addEventListener('change', () => {
    currentTopic = topicFilter.value;
    currentCardIndex = 0;
    showCard(0);
  });
}

// Filter flashcards by topic
function getFilteredFlashcards() {
  return currentTopic === 'All'
    ? flashcards
    : flashcards.filter(card => card.topic === currentTopic);
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
  document.getElementById('answer').textContent = card.answer;
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
