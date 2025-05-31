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
      const container = document.getElementById('flashcardsContainer');
      container.innerHTML = '';

      const grouped = {};
      data.forEach(card => {
        if (!grouped[card.topic]) grouped[card.topic] = [];
        grouped[card.topic].push(card);
      });

      for (const topic in grouped) {
        const section = document.createElement('div');
        section.classList.add('topic-section');

        const header = document.createElement('div');
        header.classList.add('topic-header');
        header.textContent = topic;
        section.appendChild(header);

        grouped[topic].forEach(card => {
          const row = document.createElement('div');
          row.classList.add('card-row');

          const question = document.createElement('textarea');
          question.value = card.question;
          question.dataset.id = card.id;
          question.dataset.field = 'question';

          const answer = document.createElement('textarea');
          answer.value = card.answer;
          answer.dataset.id = card.id;
          answer.dataset.field = 'answer';

          const actions = document.createElement('div');
          actions.classList.add('actions');

          const updateBtn = document.createElement('button');
          updateBtn.textContent = 'Update';
          updateBtn.onclick = () => updateCard(card.id);

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = () => deleteCard(card.id);

          actions.appendChild(updateBtn);
          actions.appendChild(deleteBtn);

          row.appendChild(question);
          row.appendChild(answer);
          row.appendChild(actions);

          section.appendChild(row);
        });

        container.appendChild(section);
      }
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
  // if (!confirm('Are you sure you want to delete this flashcard?')) return;

  fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
    // , headers: { Authorization: authHeader }
  }).then(response => {
    if (!response.ok) return alert('Delete failed.');
    loadFlashcards();
  });
}

// Download CSV
document.getElementById('downloadCsvBtn').addEventListener('click', () => {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let csv = 'Topic,Question,Answer\n';
      data.forEach(card => {
        csv += `"${card.topic}","${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
});

// Upload CSV
document.getElementById('uploadCsvInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const lines = event.target.result.split('\n').slice(1); // skip header
    const promises = lines.map(line => {
      const [topic, question, answer] = line.split(',').map(s => s?.replace(/"/g, '').trim());
      if (topic && question && answer) {
        return fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, question, answer })
        });
      }
    });
    Promise.all(promises).then(() => {
      alert('CSV upload complete.');
      loadFlashcards();
    });
  };
  reader.readAsText(file);
});
