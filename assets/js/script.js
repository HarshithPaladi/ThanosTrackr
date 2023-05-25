var map;
var pulsingDot;
var stones = [
    {
        name: 'Mind Stone',
        image: 'assets/images/Mind_Stone_VFX.webp',
        location: ([72.8777, 19.0760])
    },
    {
        name: 'Power Stone',
        image: 'assets/images/Power_Stone_VFX.webp',
        location: [-26.52989, -59.0]
    },
    {
        name: 'Reality Stone',
        image: 'assets/images/Reality_Stone_VFX.webp',
        location: [77.15226, 70.22979]
    },
    {
        name: 'Soul Stone',
        image: 'assets/images/Soul_Stone_VFX.webp',
        location: [2.73639, 44.08465]
    },
    {
        name: 'Space Stone',
        image: 'assets/images/Space_Stone_VFX.webp',
        location: [35.71805, -83.82294]
    },
    {
        name: 'Time Stone',
        image: 'assets/images/Time_Stone_VFX.webp',
        location: [3.93420, 31.41928]
    }
];
var popup;

function initializeMap(centerCoordinates) {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=ay1b2HnVwvraYQcRpld9',
        center: centerCoordinates,
        zoom: 1,
    });
}

function initializePulsingDot() {
    var size = 200;

    pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        onAdd: function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

        render: function () {
            var duration = 1000;
            var t = (performance.now() % duration) / duration;

            var radius = (size / 2) * 0.3;
            var outerRadius = (size / 2) * 0.7 * t + radius;
            var context = this.context;

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
            context.fill();

            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            map.triggerRepaint();

            return true;
        }
    };
}

function initializePopup() {
    popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });
}

async function showMapAndStones(stoneIndex) {
    console.log("Stone Index: " + stoneIndex);
    let coordinates = stones[stoneIndex].location;
    let stoneName = stones[stoneIndex].name;

    if (!map) {
        initializeMap([0, 0]);
        initializePulsingDot();
        initializePopup();

        map.on('load', function () {
            map.addImage('pulsing-dot-' + stoneName, pulsingDot, { pixelRatio: 2 });
        });
    }

    if (map.getSource('points-' + stoneName)) {
        map.removeLayer('points-' + stoneName);
        map.removeSource('points-' + stoneName);
    }

    map.addImage('pulsing-dot-' + stoneName, pulsingDot, { pixelRatio: 2 });
    map.addSource('points-' + stoneName, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    }
                }
            ]
        }
    });

    map.addLayer({
        id: 'points-' + stoneName,
        type: 'symbol',
        source: 'points-' + stoneName,
        layout: {
            'icon-image': 'pulsing-dot-' + stoneName
        }
    });

    map.flyTo({ center: coordinates, zoom: 7 });

    map.on('mouseenter', 'points-' + stoneName, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'points-' + stoneName, function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseover', 'points-' + stoneName, function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var stone = stones[stoneIndex]; // Replace with your logic to determine the stone based on coordinates

        popup.setLngLat(coordinates)
            .setHTML(
                '<div style="text-align:center" id="hover-window">' +
                '<img src="' + stone.image + '" alt="' + stone.name + '" style="max-width: 100px; max-height: 100px;"/>' +
                '<h5>' + stone.name + '</h5>' +
                '</div>'
            )
            .addTo(map);
    });

    map.on('mouseout', 'points-' + stoneName, function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}


// Initialize the map when the page loads
initializeMap([0, 0]);
initializePulsingDot();
initializePopup();


// for infinity stones page
function openAndLoadMap(stoneIndex) {
    window.open("map.html" + "?stoneIndex=" + stoneIndex, "_self");
}

// write a function to get the url parameter stoneIndex
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
async function loadMap() {
    window.onload = function () {
        var stoneIndex = parseInt(getUrlParameter("stoneIndex"));
        // if (isNaN(stoneIndex)) {
        //     stoneIndex = 0;
        // }
        console.log("Here is " + stoneIndex);
        // window.addEventListener("load", function () {
        //     var loadingOverlay = document.getElementById("loadingOverlay");

        //     setTimeout(function () {
        //         loadingOverlay.classList.add("loading-overlay-hidden");
        //     }, 1000);
        // });
        setTimeout(async function () {
            await showMapAndStones(stoneIndex);
        }, 1800);
    };
    window.addEventListener("load", function () {
        var loadingOverlay = document.getElementById("loadingOverlay");
        setTimeout(function () {
            loadingOverlay.classList.add("loading-overlay-hidden");
        }, 1000);
    });

}
async function loadMapByStoneIndex() {
    // This calls the function to load the map
    loadMap();
}