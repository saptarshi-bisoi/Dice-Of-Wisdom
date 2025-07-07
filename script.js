const button = document.querySelector(".btn");

button.addEventListener("click", generateAdvice);

async function generateAdvice() {
  const adviceData = await fetch("https://api.adviceslip.com/advice");

  const adviceObj = await adviceData.json();

  const header = document.querySelector(".header");
  const text = document.querySelector(".text");

  header.innerHTML = `ADVICE #${adviceObj.slip.id}`;
  text.innerHTML = `"${adviceObj.slip.advice}"`;
}
