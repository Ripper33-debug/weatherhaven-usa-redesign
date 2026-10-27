const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function scrambleText(element: HTMLElement, finalText: string) {
  if (element.dataset.scrambled === "1") return;
  element.dataset.scrambled = "1";

  let iteration = 0;
  const interval = window.setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((char, i) => {
        if (char === " ") return " ";
        if (i < iteration) return finalText[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    iteration += 0.5;
    if (iteration >= finalText.length) window.clearInterval(interval);
  }, 30);
}
