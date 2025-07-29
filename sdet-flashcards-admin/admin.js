const apiUrl = 'https://sdet-flashcards-api.onrender.com/flashcards'; // Your backend URL

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

          const question = document.createElement('div');
          question.classList.add('card-question');
          question.textContent = card.question;

          const answer = document.createElement('div');
          answer.classList.add('card-answer');
          answer.textContent = card.answer;

          row.appendChild(question);
          row.appendChild(answer);
          section.appendChild(row);
        });

        container.appendChild(section);
      }
    })
    .catch(err => {
      alert('Error: ' + err.message);
    });
}

// Download JSON
document.getElementById('downloadJsonBtn').addEventListener('click', () => {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Sort alphabetically by topic
      data.sort((a, b) => a.topic.localeCompare(b.topic));

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.json';
      a.click();
      URL.revokeObjectURL(url);
    });
});

// Upload JSON (clear DB first, then add new data)
document.getElementById('uploadJsonInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const flashcards = JSON.parse(event.target.result);

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        alert('No valid flashcards found in JSON.');
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
          alert('JSON upload complete. Flashcards replaced.');
          document.getElementById('uploadJsonInput').value = ''; // Clear file input
          loadFlashcards();
        })
        .catch(err => {
          alert('Error uploading JSON: ' + err.message);
        });
    } catch (err) {
      alert('Invalid JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
});
