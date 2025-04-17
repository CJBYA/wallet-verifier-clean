document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const resultBox = document.getElementById('result');

  resultBox.innerText = "Verifying...";

  const res = await fetch('/.netlify/functions/wallet-check-final', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await res.json();
  resultBox.innerText = result.wallet || result.error || "Unknown response.";
});