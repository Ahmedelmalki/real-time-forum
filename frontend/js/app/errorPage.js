export const showErrorPage = (status) => {
    document.getElementById('header').style.display = 'none';
    if (status === 404 || status === 500) {
      const container = document.getElementById('container') || document.body;
      container.style.display = 'flex';
      container.innerHTML = /*html*/`
          <div class="error-content">
            <i class="fa-solid ${status === 404 ? 'fa-circle-question' : 'fa-triangle-exclamation'} error-icon"></i>
            <h1>${status}</h1>
            <h2>${status === 404 ? 'Page Not Found' : 'Internal Server Error'}</h2>
            <p>${status === 404 ? 'The page you are looking for is unavailable.' : 'Something went wrong. Please try again later.'}</p>
            <button class="error-btn" id="${status === 404 ? 'go-home' : 'reload'}">
              <i class="fa-solid ${status === 404 ? 'fa-home' : 'fa-rotate-right'}"></i> 
              ${status === 404 ? 'Go to Home' : 'Reload'}
            </button>
          </div>
      `;
  
      const goHome = document.getElementById('go-home');
      if (goHome) {
        goHome.addEventListener('click', async() => {
            history.pushState(null, null, '/');
            await handleRoute();
        });
      }
  
      const reload = document.getElementById('reload');
      if (reload) {
        reload.addEventListener('click', () => {
          location.reload();
        });
      }
    } 
  };
  