const apiUrl = 'https://sdet-flashcards-api.onrender.com/flashcards'; // Replace with your backend URL

// Load flashcards on page load
loadFlashcards();

function loadFlashcards() {
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error('Error loading flashcards');
      return response.json();
    })
    .then(data => {
      // Sort by topic alphabetically
      data.sort((a, b) => a.topic.localeCompare(b.topic));

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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).then(response => {
    if (!response.ok) return alert('Update failed. ' + err.message);
    loadFlashcards();
  });
}

// Delete flashcard
function deleteCard(id) {
  fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  }).then(response => {
    if (!response.ok) return alert('Delete failed.' + err.message);
    loadFlashcards();
  });
}

// Download CSV
document.getElementById('downloadCsvBtn').addEventListener('click', () => {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Sort alphabetically by topic
      data.sort((a, b) => a.topic.localeCompare(b.topic));

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

// Upload CSV (clear DB first, then add new data)
document.getElementById('uploadCsvInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const lines = event.target.result.split('\n').slice(1); // skip header
    const flashcards = lines
      .map(line => {
        const [topic, question, answer] = line.split(',').map(s => s?.replace(/"/g, '').trim());
        if (topic && question && answer) {
          return { topic, question, answer };
        }
        return null;
      })
      .filter(item => item !== null);

    if (flashcards.length === 0) {
      alert('No valid flashcards found in CSV.');
      return;
    }

    // Step 1: Delete all existing flashcards
    fetch(apiUrl)
      .then(response => response.json())
      .then(existing => {
        const deletePromises = existing.map(card =>
          fetch(`${apiUrl}/${card.id}`, { method: 'DELETE' })
        );

        return Promise.all(deletePromises);
      })
      .then(() => {
        // Step 2: Add new flashcards
        const addPromises = flashcards.map(card =>
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card)
          })
        );

        return Promise.all(addPromises);
      })
      .then(() => {
        alert('CSV upload complete. Flashcards replaced.');
        document.getElementById('uploadCsvInput').value = ''; // Clear file input
        loadFlashcards();
      })
      .catch(err => {
        alert('Error uploading CSV: ' + err.message);
      });
  };
  reader.readAsText(file);
});
