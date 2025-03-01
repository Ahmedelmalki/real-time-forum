export function showErrorPage(status, message) {
  const container = document.getElementById("container");
  const chat = document.querySelector("#chat");
  if (chat) chat.style.display = "none";

  // Save current display state
  container.style.display = "block";

  // Create error page content
  container.innerHTML = /*html*/ `
        <div class="error-container">
            <div class="error-status">${status}</div>
            <div class="error-message">${message}</div>
            <button class="error-home-btn" href="/" data-link>Back Home</button>
        </div>
    `;
}

// Function to restore original state
export function hideErrorPage() {
  const errorContainer = document.querySelector(".error-container");
  if (errorContainer) {
    errorContainer.remove();
  }
}

export async function handleApiError(response, defaultRedirect = "/") {
  if (response.status === 401) {
    history.pushState(null, null, "/login");
    await handleRoute();
    return;
  }

  const errorText = await response.text();
  showErrorPage(response.status, errorText || "An error occurred");

  // Optional: Auto-redirect after a few seconds
  setTimeout(() => {
    history.pushState(null, null, defaultRedirect);
    handleRoute();
  }, 3000);
}
