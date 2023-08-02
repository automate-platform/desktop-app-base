const $ = require('jquery');

let clickCountApp = 0;
$('.app-not-installed .pane-header').on('click', function (e) {
  clickCountApp++;
  if (clickCountApp % 2 === 1) {
    $(".extension .resize").hide();
    $(".extension").animate({ top: `${-($(".extension").offset().top - e.pageY) + 14}px` }, 300)
    $(".app-not-installed .monaco-list").animate({ opacity: '0' }, 300);
    $('.app-not-installed .bx-chevron-right').removeClass("bx-rotate-90");
  } else {
    $(".extension .resize").show();
    $(".extension").animate({ top: '0px' }, 300)
    $(".app-not-installed .monaco-list").animate({ opacity: '1' }, 300);
    $('.app-not-installed .bx-chevron-right').addClass("bx-rotate-90");
  }
});

var clickCountExtention = 0;
$('.extension .pane-header').on('click', function (e) {
  clickCountExtention++;
  if (clickCountExtention % 2 === 1) {
    $(".app-installed .resize").hide();
    $(".app-installed").animate({ top: `${-($(".app-installed").offset().top - e.pageY) + 14}px` }, 300)
    $(".extension .monaco-list").animate({ opacity: '0' }, 300);
    $('.extension .bx-chevron-right').removeClass("bx-rotate-90");
  } else {
    $(".app-installed .resize").show();
    $(".app-installed").animate({ top: '0px' }, 300)
    $('.extension .bx-chevron-right').addClass("bx-rotate-90");
    $(".extension .monaco-list").animate({ opacity: '1' }, 300);
  }
});

var clickCountInstall = 0;
$('.app-installed .pane-header').on('click', function () {
  clickCountInstall++;
  if (clickCountInstall % 2 === 1) {
    $(".app-installed .monaco-list").hide();
    $('.app-installed .bx-chevron-right').removeClass("bx-rotate-90");
  } else {
    $('.app-installed .bx-chevron-right').addClass("bx-rotate-90");
    $(".app-installed .monaco-list").show();
  }
});
// $('.app-installed .pane-header').trigger("click");



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


// var m_pos;
// var resize_el = document.querySelector('.app-installed .resize');
// var minBottom = -200; // Minimum bottom value (in pixels)
// var maxBottom = 0; // Maximum bottom value (in pixels)

// function resize(e) {
//   var parent = resize_el.parentNode;
//   var dx = m_pos - e.y;
//   m_pos = e.y;

//   // Calculate the new bottom value within the limits
//   var newBottom = parseInt(getComputedStyle(parent).top) - dx;
//   newBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));

//   parent.style.top = newBottom + "px";
// }


// resize_el.addEventListener("mousedown", function (e) {
//   m_pos = e.y;
//   document.addEventListener("mousemove", resize, false);
// }, false);
// document.addEventListener("mouseup", function () {
//   document.removeEventListener("mousemove", resize, false);
// }, false);

// var m_pos1;
// var resize_el1 = document.querySelector('.extension .resize');
// var minBottom1 = -200; // Minimum bottom value (in pixels)
// var maxBottom1 = 0; // Maximum bottom value (in pixels)

// function resize1(e) {
//   var parent = resize_el1.parentNode;
//   var dx = m_pos1 - e.y;
//   m_pos1 = e.y;

//   // Calculate the new bottom value within the limits
//   var newBottom = parseInt(getComputedStyle(parent).top) - dx;
//   newBottom = Math.max(minBottom1, Math.min(maxBottom1, newBottom));

//   parent.style.top = newBottom + "px";
// }


// resize_el1.addEventListener("mousedown", function (e) {
//   m_pos1 = e.y;
//   document.addEventListener("mousemove", resize1, false);
// }, false);
// document.addEventListener("mouseup", function () {
//   document.removeEventListener("mousemove", resize1, false);
// }, false);
