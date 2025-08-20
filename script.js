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

document.getElementById("filterToggleBtn").addEventListener("click", () => {
  const filterContainer = document.getElementById("filterContainer");
  filterContainer.style.display =
    filterContainer.style.display === "none" || filterContainer.style.display === ""
      ? "flex"
      : "none";
});


function populateTopics() {
  const container = document.getElementById('topicCheckboxes');
  const topics = [...new Set(flashcards.map(card => card.topic))].sort();

  // Add "All Topics" checkbox
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = 'allTopics';
  allCheckbox.checked = true;

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

    const label = document.createElement('label');
    label.textContent = topic;

    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });

  container.addEventListener('change', (e) => {
    const target = e.target;
  
    if (target.id === 'allTopics') {
      // If "All Topics" is checked, uncheck all individual topics
      if (target.checked) {
        document.querySelectorAll('.topicCheckbox').forEach(cb => cb.checked = false);
      }
    } else {
      // If any topic checkbox is checked, uncheck "All Topics"
      document.getElementById('allTopics').checked = false;
    }
  
    currentCardIndex = 0;
    showCard(0);
  });
  
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
