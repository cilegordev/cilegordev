// document.addEventListener("DOMContentLoaded", function () {
//    document.querySelector("a").addEventListener("click", function (e) {
//      e.preventDefault();
//      chrome.tabs.create({ url: e.target.href });
//    });
//  });

  document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const linkUrl = link.getAttribute("href");
        chrome.tabs.create({ url: linkUrl });
      });
    });
  });
  