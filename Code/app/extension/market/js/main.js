const $ = require('jquery');

let clickCountNot = 0;
$('.app-not-installed .pane-header').on('click', function () {
  clickCountNot++;
  if (clickCountNot % 2 === 1) {
    $(".app-not-installed .monaco-list").animate({height:'0px'},300);
    $('.app-not-installed .bx-chevron-right').removeClass("bx-rotate-90");
  } else {
    $('.app-not-installed .bx-chevron-right').addClass("bx-rotate-90");
    $(".app-not-installed .monaco-list").animate({height:'300px'},300);
  }
});

var clickCountYes = 0;
$('.app-installed .pane-header').on('click', function () {
  clickCountYes++;
  if (clickCountYes % 2 === 1) {
    $(".app-installed .monaco-list").animate({height:'0px'},300);
    $('.app-installed .bx-chevron-right').removeClass("bx-rotate-90");
  } else {
    $('.app-installed .bx-chevron-right').addClass("bx-rotate-90");
    $(".app-installed .monaco-list").animate({height:'300px'},300);
  }
});

let tabs = document.querySelectorAll(".tab-header");

// tabs.forEach((tab, index) => {
//     tab.addEventListener('click', () =>{


//         contents.forEach((c) => c.classList.remove("active"));
//         contents[index].classList.add("active");
//     });
// });

tabs[0].click();

function ClickFunc(tab, content) {
  let tabs = document.querySelectorAll(".tab-header");
  let contents = document.querySelectorAll(".tab-content");
  tabs.forEach((tabb) => tabb.classList.remove("active"));
  tab.addClass("active");
  contents.forEach((c) => c.classList.remove("active"));
  content.addClass("active");
}
