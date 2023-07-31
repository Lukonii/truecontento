document.addEventListener("DOMContentLoaded", function () {
  var loggedIn = false;
  if (localStorage.getItem("token")) {
    loggedIn = true;
  }
  var navbar = document.getElementById("navbarNav");
  if (loggedIn) {
    refreshToken();
    var profilePic = localStorage.getItem("profilePic");
    const availableCredits = localStorage.getItem("availableCredits");
    var profilePicHTML = "";
    if (profilePic && !profilePic.valueOf(undefined)) {
      profilePicHTML =
        `
      <li class="nav-item dropdown">
        <a class="navbar-brand" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="` +
        profilePic +
        `" alt="User Image" class="rounded-circle " width="30" height="30">
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
            <li><a class="dropdown-item" href="/pricing.html">Buy credits</a></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">Sign out</a></li>
          </ul>
      </li>
      `;
    } else {
      profilePicHTML = `
      <li class="nav-item dropdown">
        <a class="navbar-brand" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="./images/user-image-placeholder.jpg" alt="User Image" class="rounded-circle " width="40" height="40">
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
            <li><a class="dropdown-item" href="/pricing.html">Buy credits</a></li>
            <li><a class="dropdown-item" onclick="logout()">Sign out</a></li>
          </ul>
      </li>
      `;
    }
    navbar.innerHTML +=
      `<ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" style="color:#ffff74;" href="/pricing.html" id="availCredits"> ` +
      availableCredits +
      ` credits</a>
      </li>` +
      profilePicHTML +
      "</ul>";
    // Modifikujte sadržaj navigacionog bara za prijavljenog korisnika
  } else {
    navbar.innerHTML += `
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="btn btn-outline-light rounded-pill" href="/auth.html">Get Started</a>
      </li>
    </ul>
    `;
    // Modifikujte sadržaj navigacionog bara za neprijavljenog korisnika
  }
});
function refreshToken() {
  const token = localStorage.getItem("token");
  const loginType = localStorage.getItem("login-type");
  const url = "/refreshToken";
  const options = {
    method: "GET",
    headers: {
      Authorization: token,
      "Login-Type": loginType,
    },
  };
  fetch(url, options)
    .then((response) => {
      if (response.status == 200) {
        return response.json();
      } else if (response.status == 401) {
        throw new Error("Refresing token error");
      }
    })
    .then((data) => {
      console.log("Token refreshed!");
      localStorage.setItem("token", data.token);
    })
    .catch((error) => {
      // obrada greške
      console.log("Refreshing token error");
    });
}

function logout() {
  console.log("loging out...");
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/auth.html";
    return;
  }
  const email = localStorage.getItem("email");
  if (!email) {
    console.log("Can not log out, email not found");
  }
  const loginType = localStorage.getItem("login-type");

  if (loginType === "google") {
    google.accounts.id.initialize({
      client_id:
        "678344678635-ob6vtiud5itdbnp5rdgrnp89krcpe9ev.apps.googleusercontent.com", //clientId
      callback: () => {
        console.log("revoke");
      },
    });
    google.accounts.id.revoke(email, (done) => {
      localStorage.clear("token");
      localStorage.clear("login-type");
      localStorage.clear("email");
      localStorage.clear("profilePic");
      localStorage.clear("availableCredits");
      // redirect na home
      window.location.assign("/");
    });
  } else {
    localStorage.clear("token");
    localStorage.clear("login-type");
    localStorage.clear("email");
    localStorage.clear("profilePic");
    localStorage.clear("availableCredits");
    // redirect na home
    window.location.assign("/");
  }
}
