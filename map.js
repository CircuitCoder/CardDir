var SCALEDIST = 40;
var ACTIVITYSIZE = 24;

var COLORMAP = {
  DEFAULT: "rgba(0,0,0,.54)",
  ORANGE: "#FF9800",
}

var mapPrimary; // For left eye and overview
var mapSecondary; // For right eye

var expanded = false;

var current;

var activities;


function initMap() {
  activities =[
    {
      latlng: new google.maps.LatLng(31.2243708, 121.5050288),
      color: "ORANGE",
      icon: "local_offer"
    }
  ];

  $(document).ready(function() {
    //TODO: Check availablity of geolocation
    
    navigator.geolocation.getCurrentPosition(function(position) {
      current = position;
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      mapPrimary = new google.maps.Map(
        document.getElementById("primary-map"), {
          zoom: 19,
          center: latlng
        });

      mapSecondary = new google.maps.Map(
        document.getElementById("secondary-map"), {
          zoom: 19,
          center: latlng
        });

      mapPrimary.setOptions({
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
      });

      mapSecondary.setOptions({
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
      });

      activities.forEach(function(e, i) {
        var icon = $('<i>').addClass('material-icons').html(e.icon);
        var lockgrid = $('<i>').addClass('material-icons').addClass('lockgrid').html("fullscreen");
        $('<div>').addClass('map-activity').attr('aid', i).css("color", COLORMAP[e.color]).append(icon).append(lockgrid).appendTo(".map-icons").click(function() {
          //TODO: info

          if(!$(this).hasClass('locked')) {
            $(".map-activity").removeClass("locked");
            $(".map-activity[aid=" + i + "]").addClass("locked");
          } else {
            $(".map-activity[aid=" + i + "]").removeClass("locked");
          }
          onMapMove();
        });
      });

      onMapMove();

      mapPrimary.addListener('bounds_changed', onMapMove);
      mapPrimary.addListener('heading_changed', onMapMove);

      //TODO: Watch Position 
      
      navigator.geolocation.watchPosition(updatePosition);
    });
  });
}

function updatePosition(pos) {
  current = pos;

  if(!expanded) {
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

    mapPrimary.panTo(latlng);
    mapSecondary.panTo(latlng);

    mapPrimary.setHeading(pos.heading);
    mapSecondary.setHeading(pos.heading);
  } else {
    $(".map-navigation-mark .material-icons").css("transform", "rotate(" + pos.heading + "deg);");
  }
}

function onMapMove() {
  var overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(mapPrimary);
  var projection = overlay.getProjection();
  if(!projection) return;

  var mapHeight = $(".map-container").height();
  var mapWidth = $(".map-container").width();

  if(expanded) {
    var currPosition = new google.maps.LatLng(current.coords.latitude, current.coords.longitude);
    var currPixel = projection.fromLatLngToContainerPixel(currPosition);
    var dx = currPixel.x - mapWidth / 2;
    var dy = currPixel.y - mapHeight / 2;

    $(".map-navigation-mark").css("transform", "translate(" + (dx - ACTIVITYSIZE / 2) + "px, " + (dy + ACTIVITYSIZE / 2) + "px) rotate(" + (current.heading ? current.heading : 0) + "deg)");
  } else {
    $(".map-navigation-mark").css("transform", "");
  }

  var activityElems = $(".map-activity");

  activities.forEach(function(e,i) {
    var newPosition = projection.fromLatLngToContainerPixel(e.latlng);

    var scale;
    var dx, dy;

    dx = newPosition.x - mapWidth / 2;
    dy = newPosition.y - mapHeight / 2;

    if(expanded) {
      scale=1;
    } else {
      // delta
      var delta = Math.sqrt(dx*dx + dy*dy);
      if(delta > 125) {
        scale = 1 - (delta-125)/SCALEDIST;
        if(scale < 0) scale = 0;
        dx *= 125/delta;
        dy *= 125/delta;
      } else {
        scale = 1;
      }
    }

    if(activityElems.filter("[aid=" + i + "]").hasClass("locked"))
      activityElems.filter("[aid=" + i + "]").css("transform", "translate(" + (dx - ACTIVITYSIZE / 2) + "px, " + (dy + ACTIVITYSIZE / 2) + "px) scale(1)");
    else
      activityElems.filter("[aid=" + i + "]").css("transform", "translate(" + (dx - ACTIVITYSIZE / 2) + "px, " + (dy + ACTIVITYSIZE / 2) + "px) scale(" + scale + ")");
  });
}

function expandMap() {
  $(".map-mask").addClass("expanded");
  mapPrimary.setHeading(0);
  mapSecondary.setHeading(0);

  setTimeout(onMapMove, 0);

  mapPrimary.setOptions({
    draggable: true,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
  });

  mapSecondary.setOptions({
    draggable: true,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
  });
}

function retractMap() {
  $(".map-mask").removeClass("expanded");

  var currentLatLng = new google.maps.LatLng(
    current.coords.latitude,
    current.coords.longitude
  );

  mapPrimary.setCenter(currentLatLng);
  mapSecondary.setCenter(currentLatLng);

  mapPrimary.setHeading(current.heading);
  mapSecondary.setHeading(current.heading);

  mapPrimary.setZoom(19);
  mapSecondary.setZoom(19);

  setTimeout(onMapMove, 0);

  mapPrimary.setOptions({
    draggable: true,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
  });

  mapSecondary.setOptions({
    draggable: true,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
  });
}
