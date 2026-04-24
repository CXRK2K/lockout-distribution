const status = document.getElementById("status");
const answer = document.getElementById("answer");
const submit = document.getElementById("submit");

status.textContent = "Connected to the local LOCKOUT room.";

submit.addEventListener("click", () => {
  if (!answer.value.trim()) {
    status.textContent = "Type your answer before submitting.";
    return;
  }

  if ("vibrate" in navigator) {
    navigator.vibrate(200);
  }

  status.textContent = "Answer sent. Blue side is talking already.";
});
