(function () {
  class UI {
    constructor() {
      this.scoreboardEl = document.getElementById("scoreboard");
      this.timerEl = document.getElementById("timer");
      this.menuInfoEl = document.getElementById("menuInfo");
      this.chatMessagesEl = document.getElementById("chatMessages");
      this.chatFormEl = document.getElementById("chatForm");
      this.chatInputEl = document.getElementById("chatInput");
      this.playerNameEl = document.getElementById("playerName");

      this.chatListeners = [];
      this.attachChatForm();
    }

    attachChatForm() {
      this.chatFormEl.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = this.chatInputEl.value.trim();
        if (!text) return;
        this.chatListeners.forEach((cb) => cb(text));
        this.chatInputEl.value = "";
      });
    }

    onChatSubmit(callback) {
      this.chatListeners.push(callback);
    }

    updateScore(red, blue) {
      this.scoreboardEl.textContent = `Rojo ${red} - ${blue} Azul`;
    }

    updateTimer(secondsLeft) {
      const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
      const s = String(secondsLeft % 60).padStart(2, "0");
      this.timerEl.textContent = `${m}:${s}`;
    }

    setMenuMessage(message) {
      this.menuInfoEl.textContent = message;
    }

    addChatMessage(author, message) {
      const line = document.createElement("div");
      line.className = "chat-message";
      line.innerHTML = `<span class="author">${this.escape(author)}:</span> ${this.escape(message)}`;
      this.chatMessagesEl.appendChild(line);
      this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
    }

    getPlayerName() {
      const value = this.playerNameEl.value.trim();
      return value || "TuJugador";
    }

    escape(text) {
      return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
  }

  window.UI = UI;
})();
