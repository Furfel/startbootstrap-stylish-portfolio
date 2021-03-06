(function($) {
  "use strict"; // Start of use strict

  // Closes the sidebar menu
  $(".menu-toggle").click(function(e) {
    e.preventDefault();
    $("#menu-wrapper").toggleClass("active");
    $(".menu-toggle > .fa-bars, .menu-toggle > .fa-times").toggleClass("fa-bars fa-times");
    $(this).toggleClass("active");
  });

  var offsetTop = $("#menu-wrapper")[0].offsetTop;

  $(window).on("scroll", function(e) {
    if( this.window.pageYOffset >= offsetTop ) {
      $("#menu-wrapper").addClass("sticky");
    } else {
      $("#menu-wrapper").removeClass("sticky");
    }
  });

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  $(window).on('popstate', function(event) {
    var state = window.history.state;
    if( state == null || state == undefined )
      this.window.location = "/";
    else {
      reload_content(state["content-src"], state["postload"]);
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('#menu-wrapper .js-scroll-trigger').click(function() {
    $("#menu-wrapper").removeClass("active");
    $(".menu-toggle").removeClass("active");
    $(".menu-toggle > .fa-bars, .menu-toggle > .fa-times").toggleClass("fa-bars fa-times");

    var content_src = $(this).attr("content-src");
    var postload = $(this).attr("postload");
    var href = $(this).attr("href");

    window.history.pushState({"content-src": content_src, "href": href, "postload": postload}, href, href);

    return reload_content(content_src, postload);

  });

  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

})(jQuery); // End of use strict

// Disable Google Maps scrolling
// See http://stackoverflow.com/a/25904582/1607849
// Disable scroll zooming and bind back the click event
var onMapMouseleaveHandler = function(event) {
  var that = $(this);
  that.on('click', onMapClickHandler);
  that.off('mouseleave', onMapMouseleaveHandler);
  that.find('iframe').css("pointer-events", "none");
}
var onMapClickHandler = function(event) {
  var that = $(this);
  // Disable the click handler until the user leaves the map area
  that.off('click', onMapClickHandler);
  // Enable scrolling zoom
  that.find('iframe').css("pointer-events", "auto");
  // Handle the mouse leave event
  that.on('mouseleave', onMapMouseleaveHandler);
}
// Enable map zooming with mouse scroll when the user clicks the map
$('.map').on('click', onMapClickHandler);

var prepareGamesContent = function(target) {
  $("#content").find(".game-link").click(function() {
    var content_src = $(this).attr("content-src");
    //var postload = $(this).attr("postload");
    var href = $(this).attr("href");

    window.history.pushState({"content-src": content_src, "href": href, "postload": ""}, href, href);

    return reload_content(content_src, "");
  });
}

function reload_content(content_src, postload) {
  if( content_src != undefined && content_src != null && content_src != "" ) {
    var spinner = $("<div>").addClass("lds-ellipsis");
    $("#content").empty();
    $("#content").append(spinner);
    var postload = postload;

    $.get(content_src, function(data) {
        $("#content").html(data);
        if( postload != null && postload != undefined && postload != "" && (typeof window[postload]) == "function" ) {
          window[postload]();
        }
      }).fail(function() {

        var h2fail = $("<h2>").addClass("failure").html("Failed to load");
        
        var buttonretry = $("<button>").addClass("btn btn-primary").html("Retry")
          .on("click", function(e){
            reload_content(content_src, postload);
          });
        
        $("#content").append(h2fail).append(buttonretry);

      });
    return false;
  }
  return true;
}