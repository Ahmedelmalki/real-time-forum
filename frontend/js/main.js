import { router } from "./routes.js";
import { isAuthenticated } from "./authentication/isAuth.js";
import { showErrorPage } from "./errorPage.js";

const publicRoutes = ["/login", "/register"];
const protectedRoutes = ["/", "/newPost", "/logout", "/comment"];

export async function handleRoute() {
  const currentPath = window.location.pathname;
  const isAuth = await isAuthenticated();
  try {
    if (!router[currentPath]){ // if current Path does not exist
      showErrorPage(404, "Page Not Found");
      console.log(currentPath, "does not exist");
      return;
    }

    if (isAuth === 0 && protectedRoutes.includes(currentPath)) { // if user is not authenticated
      history.pushState(null, null, "/login");
      await router["/login"].call();
      return;
    }

    if (isAuth !== 0 && publicRoutes.includes(currentPath)) { // if user is authenticated and wanna access login or register page
      history.pushState(null, null, "/");
      await router["/"].call();
      return;
    }

    // If route exists and auth checks pass, render the route
    await router[currentPath].call();
    
  } catch (e) {
    console.error("Routing Error:", e);
    showErrorPage(500, "Internal Server Error");

  }
}

document.addEventListener("click", async(event) => {
  if (event.target.hasAttribute("data-link")) {
    event.preventDefault();
    const link = event.target.getAttribute("href");
    history.pushState(null, null, link);
    await handleRoute();
  }
});

window.addEventListener("popstate", async() => {
 await handleRoute();
});

await handleRoute();

