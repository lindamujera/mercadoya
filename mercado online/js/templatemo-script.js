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

// =========================================================================
// INTERCEPCIONES DE FORMULARIOS INTEGRADAS (CORRECCIONES PARA CLEVER CLOUD)
// =========================================================================

document.addEventListener("DOMContentLoaded", function() {
    // 1. URL DE TU APP EN CLEVER CLOUD 
    // (Cambia el "tu-app-aqui" por el nombre real de tu aplicación en Clever Cloud)
       const URL_CLEVER_CLOUD = 'https://onrender.com';

    // Envío Asíncrono para el Formulario de Contacto (Página 4)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const responseDiv = document.getElementById('formResponse');
            if (responseDiv) responseDiv.innerHTML = '<span style="color: #ffc107; font-weight: bold;">Enviando mensaje...</span>';
            
            const formData = new FormData(this);

            fetch(URL_CLEVER_CLOUD, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (responseDiv) responseDiv.innerHTML = '<span style="color: #28a745; font-weight: bold;">¡Mensaje enviado con éxito al servidor!</span>';
                    contactForm.reset();
                } else {
                    if (responseDiv) responseDiv.innerHTML = '<span style="color: #dc3545; font-weight: bold;">Ocurrió un error al guardar en la base de datos.</span>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (responseDiv) responseDiv.innerHTML = '<span style="color: #dc3545; font-weight: bold;">Error de conexión con Clever Cloud.</span>';
            });
        });
    }

    // Envío Asíncrono para el Formulario del Carrito (Página 2)
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof carrito === 'undefined' || carrito.length === 0) return;

            const respuesta = document.getElementById('checkout-response');
            if (respuesta) respuesta.innerHTML = '<span style="color: #ffc107; font-weight: bold;">Registrando pedido en la base de datos...</span>';

            const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

            // Estructurar los campos para que coincidan con tu tabla 'reservas' en MySQL
            const datosParaBaseDatos = new FormData();
            datosParaBaseDatos.append('name', document.getElementById('customerName').value);
            datosParaBaseDatos.append('email', 'cliente@mercadoya.com'); 
            datosParaBaseDatos.append('message', 'Pedido Domicilio. Total: \$' + total.toLocaleString('es-CO'));

            fetch(URL_CLEVER_CLOUD, {
                method: 'POST',
                body: datosParaBaseDatos
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    if (respuesta) respuesta.innerHTML = '<span style="color: #28a745; font-weight: bold;">¡Pedido guardado! Abriendo WhatsApp...</span>';
                    
                    // Proceder a enviar el texto formateado por WhatsApp
                    const lineas = carrito.map(item => `${item.cantidad} x ${item.nombre}: $${(item.precio * item.cantidad).toLocaleString('es-CO')}`);
                    const mensaje = [
                      'Hola, quiero confirmar este pedido de MercadoYa:',
                      ...lineas,
                      `Total: $${total.toLocaleString('es-CO')}`,
                      `Nombre: ${document.getElementById('customerName').value}`,
                      `Teléfono: ${document.getElementById('customerPhone').value}`,
                      `Dirección: ${document.getElementById('customerAddress').value}`
                    ].join('\n');

                    // ENLACE DE WHATSAPP REPARADO Y COMPLETO
                    window.open(`https://wa.me{encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
                    
                    // Limpiar el carrito local tras el éxito completo
                    if (typeof vaciarCarrito === 'function') {
                        carrito = [];
                        checkoutForm.reset();
                        actualizarCarrito();
                        ocultarFormularioPedido();
                    }
                } else {
                    if (respuesta) respuesta.innerHTML = '<span style="color: #dc3545; font-weight: bold;">Error al registrar la orden en el servidor.</span>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (respuesta) respuesta.innerHTML = '<span style="color: #dc3545; font-weight: bold;">Error de red con Clever Cloud.</span>';
            });
        });
    }
});
