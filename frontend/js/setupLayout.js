export async function setuplayout() {
  if (!document.querySelector("#button-group")) {
    Profile = await getProfile();
    console.log('profile :', Profile);
    
    const header = document.createElement("header");
    header.id = "button-group";
    header.className = "button-group";
    header.innerHTML = /*html*/`
          <div class="profilePic" id=${Profile.Id}> 
              ${Profile.FirstName[0]}${Profile.LastName[0]}
            <div class="profileNicknime">
              ${Profile.Nickname}
            </div>
          </div>
        <button id="logout"  class="logedout" href="/logout" data-link>
          <img class="logedout" src="/frontend/img/logout.png" alt=""> logout
        </button>
        <button id="newPost" class="logedout" href="/newPost" data-link>
          + new post
        </button>
        `;

    const h = document.createElement("h1");
    h.id = "forum";
    h.innerHTML = /*html*/`
        <img src="/frontend/img/home.png"  class="home-icon">  forum
        `;

    document.getElementById("header").appendChild(h);
    document.getElementById("header").appendChild(header);
    h.addEventListener("click", async () => {
      window.location.href = "/";
    });

    document.addEventListener("DOMContentLoaded", () => {
      if (Notification.permission === "default") {
          Notification.requestPermission();
      }
  });
  }
}

export var Profile = {
  Id : "",
  Nickname : "",
  FirstName : "",
  LastName : "",
};

async function getProfile() {
  try {
    const res = await fetch("/profile");
    if (!res.ok) {
      throw new error();
    }
    const profile = await res.json();
    return profile;
  } catch (error) {
    console.error("error getting profile", error);
  }
}