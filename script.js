class AdviceGenerator {
  constructor() {
    this.button = document.querySelector(".dice-button");
    this.card = document.querySelector(".advice-card");
    this.adviceId = document.querySelector(".advice-id");
    this.adviceText = document.querySelector(".advice-text");
    this.isLoading = false;
    this.adviceCount = 0;

    this.init();
  }

  init() {
    this.button.addEventListener("click", () => this.generateAdvice());
    this.setupHoverEffects();
    this.showWelcomeMessage();
  }

  async generateAdvice() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.setLoadingState(true);

    try {
      // Immediate visual feedback
      this.showLoadingMessage();

      // Try to fetch advice with multiple fallbacks
      const advice = await this.fetchAdviceWithFallback();

      // Update UI with smooth transitions
      await this.updateAdvice(advice);

      // Success animation
      this.showSuccessAnimation();
    } catch (error) {
      console.error("Error fetching advice:", error);
      this.showErrorMessage(error);
    } finally {
      this.setLoadingState(false);
      this.isLoading = false;
    }
  }

  async fetchAdviceWithFallback() {
    // Try multiple API endpoints
    const endpoints = [
      "https://api.adviceslip.com/advice",
      "https://api.adviceslip.com/advice/1",
      "https://api.adviceslip.com/advice/2",
    ];

    for (let i = 0; i < endpoints.length; i++) {
      try {
        const advice = await this.fetchAdvice(endpoints[i]);
        return advice;
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoints[i]}:`, error);
        if (i === endpoints.length - 1) {
          // If all endpoints fail, use fallback advice
          return this.getFallbackAdvice();
        }
      }
    }
  }

  async fetchAdvice(endpoint) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.slip || data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getFallbackAdvice() {
    this.adviceCount++;
    const fallbackAdvice = [
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Life is what happens when you're busy making other plans.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Don't watch the clock; do what it does. Keep going.",
      "The only limit to our realization of tomorrow is our doubts of today.",
      "Believe you can and you're halfway there.",
      "It always seems impossible until it's done.",
      "The journey of a thousand miles begins with one step.",
    ];

    const randomAdvice =
      fallbackAdvice[Math.floor(Math.random() * fallbackAdvice.length)];

    return {
      id: `FALLBACK-${this.adviceCount}`,
      advice: randomAdvice,
    };
  }

  showLoadingMessage() {
    this.adviceId.textContent = "ADVICE #...";
    this.adviceText.textContent = "Loading wisdom from the digital realm...";
  }

  async updateAdvice(advice) {
    // Fade out
    this.adviceText.style.opacity = "0";
    this.adviceText.style.transform = "translateY(10px)";

    await this.delay(150);

    // Update content
    this.adviceId.textContent = `ADVICE #${advice.id}`;
    this.adviceText.textContent = `"${advice.advice}"`;

    // Fade in
    this.adviceText.style.opacity = "1";
    this.adviceText.style.transform = "translateY(0)";

    await this.delay(150);
  }

  showSuccessAnimation() {
    this.card.classList.add("success");
    setTimeout(() => {
      this.card.classList.remove("success");
    }, 600);
  }

  showErrorMessage(error) {
    let message = "Network error. Using offline wisdom...";

    // Use fallback advice instead of showing error
    const fallbackAdvice = this.getFallbackAdvice();
    this.adviceId.textContent = `ADVICE #${fallbackAdvice.id}`;
    this.adviceText.textContent = `"${fallbackAdvice.advice}"`;

    // Show a subtle indicator that we're using offline mode
    this.card.style.borderColor = "rgba(255, 165, 0, 0.5)";
    setTimeout(() => {
      this.card.style.borderColor = "";
    }, 2000);
  }

  setLoadingState(loading) {
    if (loading) {
      document.body.classList.add("loading");
      this.button.disabled = true;
      this.button.style.transform = "scale(0.95)";
    } else {
      document.body.classList.remove("loading");
      this.button.disabled = false;
      this.button.style.transform = "";
    }
  }

  setupHoverEffects() {
    this.button.addEventListener("mouseenter", () => {
      if (!this.isLoading) {
        this.button.style.transform = "scale(1.05)";
      }
    });

    this.button.addEventListener("mouseleave", () => {
      if (!this.isLoading) {
        this.button.style.transform = "scale(1)";
      }
    });
  }

  showWelcomeMessage() {
    this.adviceText.textContent =
      "Click the dice to unlock wisdom from the digital realm...";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AdviceGenerator();
});

// Add performance optimizations
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
