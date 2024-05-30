const scoreElement = document.getElementById("score");
const scorelabel = document.querySelector(".mesg")
// function randomZeroOrOne() {
//   // Use Math.random() to generate a random number between 0 (inclusive) and 1 (exclusive)
//   const randomNumber = Math.random();

//   // Check if the number is less than 0.5, return 0, otherwise return 1
//   return randomNumber < 0.5 ? 0 : 1;
// }

// predictedLabel=randomZeroOrOne()

// if (predictedLabel === 1) {
//   scoreElement.textContent = "High";
//   scorelabel.textContent = "High";
// } else {
//   scoreElement.textContent = "Low";
//   scorelabel.textContent = "Low";
// }

document.addEventListener('DOMContentLoaded', function() {
  fetchResults();
});

function fetchResults() {
  fetch('http://127.0.0.1:5000/get_results')
      .then(response => response.json())
      .then(data => {
          // Display the results on the page
          const resultsDiv = document.getElementById('results');
          resultsDiv.textContent = JSON.stringify(data);
      })
      .catch(error => {
          console.error('Error:', error);
          // Handle errors
      });
}
