let flashcards = [];
let index = 0;

// Fetch the flashcards.csv file when the page loads
fetch('flashcards.csv')
  .then(response => response.text())
  .then(data => {
    const lines = data.split('\n').slice(1); // Skip header
    flashcards = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const [question, answer] = line.split(',');
        return { question: question.trim(), answer: answer.trim() };
      });
    index = 0;
    showCard();
  })
  .catch(error => {
    document.getElementById('question').textContent = 'Error loading flashcards.';
    console.error('Error loading flashcards:', error);
  });

function showCard() {
  if (flashcards.length === 0) return;
  const card = flashcards[index];
  document.getElementById('question').textContent = card.question;
  document.getElementById('answer').textContent = card.answer;
  document.getElementById('answer').style.display = 'none';
}

document.getElementById('showAnswerBtn').addEventListener('click', function () {
  document.getElementById('answer').style.display = 'block';
});

document.getElementById('nextBtn').addEventListener('click', function () {
  if (flashcards.length === 0) return;
  index = (index + 1) % flashcards.length;
  showCard();
});

document.getElementById('prevBtn').addEventListener('click', function () {
  if (flashcards.length === 0) return;
  index = (index - 1 + flashcards.length) % flashcards.length;
  showCard();
});
