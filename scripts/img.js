document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    const imgCopy = img.cloneNode();
    overlay.appendChild(imgCopy);
    const msg = document.createElement("p");
    msg.style.cssText = "color: #fff; font-weight: 500; margin: 0";
    msg.innerText = "Click anywhere to close";
    overlay.appendChild(msg);
    overlay.addEventListener("click", () => {
      overlay.classList.remove("active");
      overlay.remove();
    });
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add("active"), 0);
  });
});
