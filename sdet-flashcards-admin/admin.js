const apiUrl = 'http://localhost:3000/flashcards';

// Load flashcards on page load
loadFlashcards();

function loadFlashcards() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('flashcardTableBody');
      tbody.innerHTML = '';

      data.forEach(card => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td><input value="${card.topic}" data-id="${card.id}" data-field="topic"></td>
          <td><input value="${card.question}" data-id="${card.id}" data-field="question"></td>
          <td><input value="${card.answer}" data-id="${card.id}" data-field="answer"></td>
          <td class="actions">
            <button onclick="updateCard(${card.id})">Update</button>
            <button onclick="deleteCard(${card.id})">Delete</button>
          </td>
        `;

        tbody.appendChild(row);
      });
    });
}

// Add flashcard
document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const topic = document.getElementById('addTopic').value.trim();
  const question = document.getElementById('addQuestion').value.trim();
  const answer = document.getElementById('addAnswer').value.trim();

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, question, answer })
  }).then(() => {
    document.getElementById('addForm').reset();
    loadFlashcards();
  });
});

// Update flashcard
function updateCard(id) {
  const inputs = document.querySelectorAll(`input[data-id='${id}']`);
  const updated = {};
  inputs.forEach(input => {
    updated[input.dataset.field] = input.value;
  });

  fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).then(loadFlashcards);
}

// Delete flashcard
function deleteCard(id) {
  if (!confirm('Are you sure you want to delete this flashcard?')) return;

  fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  }).then(loadFlashcards);
}
