var Three = THREE;
var camera,
    light,
    renderer,
    scene,
    shape,
    wireframe,
    textMeshes = [],
    controls,
    WIDTH,
    HEIGHT;

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;

var ASPECT = WIDTH / HEIGHT;
var NEAR = 0.1;
var FAR = 1000;
var FOV = 45;

const topics = ["Профил", "Задачи", "Контакт", "Формули", "Аксиоми", "Профил", "Задачи", "Контакт", "Формули", "Аксиоми", "Формули", "Аксиоми"]

var element = document.getElementById('container');

function init(element) {
    var el = element;
    setupScene();
    light = createLights();
    shape = addPoints(50, 124, 124);
    wireframe = addWireframe(0xc3c3c3)
    addTextToSides()

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    el.addEventListener('dblclick', onDocumentMouseClick, false);

    render();
}

init(element);

function setupScene() {
    renderer = new Three.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(WIDTH, HEIGHT);

    camera = new Three.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 300;

    scene = new Three.Scene();

    $(element).append(renderer.domElement);
}


function createLights() {
    var light = new Three.AmbientLight(0xf0f0f0);
    light.position.x = 0;
    light.position.y = 0;
    light.position.z = 500;
    scene.add(light);
    return light;
}

function addPoints(radius) {
    var DETAIL = 0;
    var geometry,
        material,
        shape;

    geometry = new Three.DodecahedronGeometry(radius, DETAIL);
    material = new Three.MeshPhongMaterial({
        color: 0x1f1f1f,
        transparent: false,
        opacity: 1,
        wireframe: false,
    });

    shape = new Three.Mesh(geometry, material);

    scene.add(shape);
    return shape;
}

function addWireframe(color, radius) {
    var DETAIL = 0;
    var geometry, material, edges;

    // Create edges geometry
    var edgesGeometry = new Three.EdgesGeometry(shape.geometry);

    // Create material for edges
    var edgesMaterial = new Three.LineBasicMaterial({
        color: color,
    });
    // Create edges mesh
    edges = new Three.LineSegments(edgesGeometry, edgesMaterial);

    scene.add(edges);
    return edges;
}
function addTextToSides() {
    var loader = new Three.FontLoader();
    loader.load('../Roboto-regular.json', function (font) {
        var faces = shape.geometry.faces;
        var faceVertexUvs = shape.geometry.faceVertexUvs[0];

        for (var i = 0; i < faces.length; i += 3) {
            var centroid = new Three.Vector3();
            var normal = new Three.Vector3();

            for (let j = 0; j < 3; j++) {
                var face = faces[i + j];

                centroid.add(shape.geometry.vertices[face.a]);
                centroid.add(shape.geometry.vertices[face.b]);
                centroid.add(shape.geometry.vertices[face.c]);

                // Use the face normal directly
                normal.copy(face.normal);
            }

            centroid.divideScalar(9);
            normal.normalize();
            console.log('Face ', Math.ceil((i + 1) / 3), ': ', normal)

            var textGeometry = new Three.TextGeometry(topics[Math.ceil((i + 1) / 3)] ?? "WiP", {
                font: font,
                size: 5,
                height: 0.5,
            });

            // Compute text size to determine the offset
            textGeometry.computeBoundingBox();
            var textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;

            var textMaterial = new Three.MeshBasicMaterial({ color: '#cccccc' });
            var textMesh = new Three.Mesh(textGeometry, textMaterial);

            // Calculate the direction vector from the centroid to the camera
            var direction = new Three.Vector3().subVectors(camera.position, centroid).normalize();

            // Calculate the offset vector based on the face normal
            var offset = 5; // Adjust the offset as needed
            var offsetVector = new Three.Vector3().copy(normal).normalize().multiplyScalar(offset);

            // Position the text on its corresponding face
            textMesh.position.copy(centroid).add(offsetVector);

            // Calculate the quaternion rotation based on the average normal
            var upVector = new Three.Vector3(0, 0, 1);
            var rotationAxis = new Three.Vector3().crossVectors(upVector, normal).normalize();
            var rotationAngle = Math.acos(upVector.dot(normal));
            textMesh.quaternion.setFromAxisAngle(rotationAxis, rotationAngle);

            scene.add(textMesh);
            textMeshes.push(textMesh);
        }
    });
}



function onDocumentMouseClick(event) {
    event.preventDefault();

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    var mouse = new Three.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting
    var raycaster = new Three.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    var intersects = raycaster.intersectObjects([shape]);

    if (intersects.length > 0) {
        // Open different URLs based on the side clicked
        console.log(Math.ceil((intersects[0].faceIndex + 1) / 3))
    }
}

function render() {

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}