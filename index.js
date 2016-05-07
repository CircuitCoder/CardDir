/* Lock to landscape */
try {
  if(screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape');
  }
} catch(e) {
  //Ignore
}


/* Setup sence */
var primaryScene = new THREE.Scene();
var secondaryScene = new THREE.Scene();

// Most cellphone cameras has a FOV of around 50. So 50 is the go
var cameraOverview = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
var cameraLeft = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight / 2, 1, 10000);
var cameraRight = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight / 2, 1, 10000);

cameraOverview.position.z = 1000;
cameraLeft.position.z = 1000;
cameraRight.position.z = 1000;

cameraLeft.position.x = -40;
cameraRight.position.x = 40;

/* Setup renderer */
var rendererOverview = new THREE.WebGLRenderer({ alpha: true });
var rendererLeft = new THREE.WebGLRenderer({ alpha: true });
var rendererRight = new THREE.WebGLRenderer({ alpha: true });

rendererOverview.setSize(window.innerWidth, window.innerHeight);
rendererLeft.setSize(window.innerWidth / 2, window.innerHeight);
rendererRight.setSize(window.innerWidth / 2, window.innerHeight);

function setupElements() {
  $(".frame-container .overview").append(rendererOverview.domElement);
  $(".frame-container .left").append(rendererLeft.domElement);
  $(".frame-container .right").append(rendererRight.domElement);
}

/* Setup renderer functions */

var cardboardMode = false;
var animating = false;

function animate(time) {
  if(animating) requestAnimationFrame(animate);

  /* Detect acceleration */
  //TODO: here
  //

  //doMapAnimation(time);
  //applyMap();

  if(cardboardMode) {
    rendererLeft.render(primaryScene, cameraLeft);
    rendererRight.render(secondaryScene, cameraRight);
  } else {
    rendererOverview.render(primaryScene, cameraOverview);
  }
}

function switchToCardboard() {
  cardboardMode = true;

  //TODO: Update google map

  $("#primary-map-mask").removeClass("overview").addClass("half");
  $("#secondary-map-mask").removeClass("hidden").addClass("half");
  $(".map-mask").removeClass("overview-mode");
  $(".map-mask").addClass("cardboard-mode");
  $(".map-icons").removeClass("overview-mode");
  $(".map-icons").addClass("cardboard-mode");

  $(".frame-container").addClass("cardboard");
}

function switchToOverview() {
  cardboardMode = false;

  $("#primary-map-mask").addClass("overview").removeClass("half");
  $("#secondary-map-mask").addClass("hidden").removeClass("half");

  $(".map-mask").addClass("overview-mode");
  $(".map-mask").removeClass("cardboard-mode");
  $(".map-icons").addClass("overview-mode");
  $(".map-icons").removeClass("cardboard-mode");

  $(".frame-container").removeClass("cardboard");
}

function startAnimation() {
  if(!animating) {
    animating = true;
    requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  animating = false;
}

/* Initialize */

$(document).ready(function() {
  setupElements();
  switchToOverview();
  startAnimation();

  $("#btn-toggle-mode").click(function() {
    if(cardboardMode) {
      $(this).removeClass("mode-cardboard");
      switchToOverview();
    } else {
      $(this).addClass("mode-cardboard");
      switchToCardboard();
    }
  });

  $("#btn-help").click(function() {
    $(".help-overlap").toggleClass("shown");
  });

  $(".help-overlap").click(function() {
    $(".help-overlap").removeClass("shown");
  });

  $(".help-card").click(function(event) {
    event.stopPropagation();
  });

  var zoomInDisabled = false;
  var zoomOutDisabled = false;

  function updateZoomBtnState() {
    if(cameraRight.position.x == cameraLeft.position.x) {
      if(!zoomOutDisabled) {
        $("#btn-zoom-out .material-icons").addClass("md-inactive");
        $("#btn-zoom-out").prop("disabled", true);
        zoomOutDisabled = true;
      }
    } else {
      if(zoomOutDisabled) {
        $("#btn-zoom-out .material-icons").removeClass("md-inactive");
        $("#btn-zoom-out").prop("disabled", false);
        zoomOutDisabled = false;
      }
    }
    
    //TODO: We need a upper limit here
  }

  $("#btn-zoom-in").click(function() {
    cameraLeft.position.x -= 20;
    cameraRight.position.x += 20;

    updateZoomBtnState();
  })

  $("#btn-zoom-out").click(function() {
    if(zoomOutDisabled) return;

    cameraLeft.position.x += 20;
    cameraRight.position.x -= 20;

    updateZoomBtnState();
  })


  $("#btn-map").click(function() {
    if(expanded) {
      $(".map-mask").removeClass("expanded");
      $(".map-icons").removeClass("expanded");
      retractMap();
      expanded = false;
    } else {
      $(".map-mask").addClass("expanded");
      $(".map-icons").addClass("expanded");
      expandMap();
      expanded = true;
    }
  });
});
