const apiUrl = 'https://sdet-flashcards-api.onrender.com/flashcards'; // Replace with your backend URL

// Prompt for admin username/password (commented out)
// const username = prompt('Enter admin username:');
// const password = prompt('Enter admin password:');
// const authHeader = 'Basic ' + btoa(username + ':' + password);

// Load flashcards on page load
loadFlashcards();

function loadFlashcards() {
  fetch(apiUrl
    // , { headers: { Authorization: authHeader } }
  )
    .then(response => {
      if (!response.ok) throw new Error('Error loading flashcards');
      return response.json();
    })
    .then(data => {
      const tbody = document.getElementById('flashcardTableBody');
      tbody.innerHTML = '';

      data.forEach(card => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td><input type="text" value="${card.topic}" data-id="${card.id}" data-field="topic"></td>
          <td><textarea data-id="${card.id}" data-field="question">${card.question}</textarea></td>
          <td><textarea data-id="${card.id}" data-field="answer">${card.answer}</textarea></td>
          <td class="actions">
            <button onclick="updateCard(${card.id})">Update</button>
            <button onclick="deleteCard(${card.id})">Delete</button>
          </td>
        `;

        tbody.appendChild(row);
      });
    })
    .catch(err => {
      alert('Error: ' + err.message);
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
    headers: {
      'Content-Type': 'application/json'
      // , Authorization: authHeader
    },
    body: JSON.stringify({ topic, question, answer })
  }).then(response => {
    if (!response.ok) return alert('Add failed.');
    document.getElementById('addForm').reset();
    loadFlashcards();
  });
});

// Update flashcard
function updateCard(id) {
  const inputs = document.querySelectorAll(`[data-id='${id}']`);
  const updated = {};
  inputs.forEach(input => {
    updated[input.dataset.field] = input.value;
  });

  fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
      // , Authorization: authHeader
    },
    body: JSON.stringify(updated)
  }).then(response => {
    if (!response.ok) return alert('Update failed.');
    loadFlashcards();
  });
}

// Delete flashcard
function deleteCard(id) {
  //if (!confirm('Are you sure you want to delete this flashcard?')) return;

  fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
    // , headers: { Authorization: authHeader }
  }).then(response => {
    if (!response.ok) return alert('Delete failed.');
    loadFlashcards();
  });
}
