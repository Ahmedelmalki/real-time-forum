import { router } from "./routes.js";
import { isAuthenticated } from "./authentication/isAuth.js";

const publicRoutes = ["/login", "/register"];
const protectedRoutes = ["/", "/newPost", "/logout", "/comment"];

export async function handleRoute() {
  const currentPath = window.location.pathname;
  const isAuth = await isAuthenticated();
  try {
    if (isAuth === 0 && protectedRoutes.includes(currentPath)) {
      history.pushState(null, null, "/login");
      await router["/login"].call();
      return;
    }

    if (isAuth !== 0 && publicRoutes.includes(currentPath)) {
      history.pushState(null, null, "/");
      await router["/"].call();
      return;
    }

    if (router[currentPath]) {
      await router[currentPath].call();
    } else{
      await router["/"].call();
      return;
    }
  } catch (e) {
    console.error("Routing Error:", e);
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

