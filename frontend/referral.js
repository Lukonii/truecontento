document.addEventListener("DOMContentLoaded", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get("ref");
  if (product) {
    localStorage.setItem("referral", product);
  }
});
