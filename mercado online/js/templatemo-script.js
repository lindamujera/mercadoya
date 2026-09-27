/*

TemplateMo 560 Astro Motion

https://templatemo.com/tm-560-astro-motion

*/

var gallery = undefined;

function closeMenu() {
  $(".navbar-collapse").removeClass("show"); 
}

function highlightMenu(no) {
  $(".navbar .navbar-nav > .nav-item").removeClass('selected');
  $(".navbar .navbar-nav > .nav-item > .nav-link[data-no='" + no + "']").parent().addClass('selected');
}

function setupGallery() {
  gallery = $('.gallery-slider').slick({
    slidesToShow: 5,
    slidesToScroll: 3,
    dots: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
}

function setBackgroundVideoForPage(pageNo) {
  var video = document.getElementById('bg-video');
  var showStillCart = Number(pageNo) === 1 || Number(pageNo) === 2 || Number(pageNo) === 4;
  video.loop = !showStillCart;

  if(showStillCart) {
    video.pause();
    if(video.readyState >= 2) {
      video.currentTime = 0;
    } else {
      video.addEventListener('loadeddata', function() {
        video.pause();
        video.currentTime = 0;
      }, { once: true });
    }
    return;
  }

  video.play().catch(function() {});
}

function openPage(no) {
  setBackgroundVideoForPage(no);
  $('body').toggleClass('purchase-active', Number(no) === 2);
  $('body').toggleClass('home-active', Number(no) === 1);
  $('body').toggleClass('promotions-active', Number(no) === 5);
  document.getElementById('promotion-callout').hidden = Number(no) !== 2;

  if(no == 2) {
    if(gallery == undefined) {
      setupGallery();
    } else {
      $('.gallery-slider').slick('unslick');
      setupGallery();
    }    
  }

  $('.cd-hero-slider li').hide();
  $('.cd-hero-slider li[data-page-no="' + no + '"]')
    .fadeIn();
}

$(window).on('load', function() {
  $('body').addClass('loaded');
  var initialPage = window.location.hash === '#promociones' ? 5 : (window.location.hash === '#comprar' ? 2 : 1);
  openPage(initialPage);
  if(initialPage === 2 && document.getElementById('cart-count').textContent !== '0') {
    mostrarFormularioPedido();
  }
});

jQuery(function() {
    $('.tm-page-link').on('click', function(){
      var pageNo = $(this).data('page-no');
      openPage(pageNo);
      highlightMenu(pageNo);
    });

    $(".navbar .navbar-nav > .nav-item > a.nav-link").on('click', function(e){
      var pageNo = $(this).data('no');

      openPage(pageNo);
      highlightMenu(pageNo);
      closeMenu();     
    });

    $("html").click(function(e) {
      closeMenu();
    });
});