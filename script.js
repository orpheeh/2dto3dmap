const MAP = new Map();
let MAP_ID = 0;
let MAP_NAME;

loadMapInfoFromURL();
loadMapFromAPI();
main();

/**
 * Ajoute un batiment dans la map et mets à jour la liste
 *  <select id="batiment-list">
 */
function addBatiment() {
    const index = MAP.addBatiment();
    const batimetListSelectDOM = document.querySelector('#batiment-list');
    const option = document.createElement('option');
    option.value = '' + index - 1;
    option.innerHTML = 'Batiment ' + index;
    batimetListSelectDOM.appendChild(option);
}

/**
 * Retire le batiment Sélectionné de la map et mets à jour liste
 */
function removeSelectedBatiment() {
    const select = document.querySelector('#batiment-list');
    const option = document.querySelector('#batiment-list option[value="' + select.value + '"]');
    if (option.value !== "none") {
        MAP.removeBatiment(MAP.selectedBatiment);
        select.removeChild(option);
        console.log(MAP);
    }
}


/**
 * Ajoute un étage au batiment sélectionné et change l'état d'un des div.step
 * MAX_STEP_COUNT = 5
 */
function addStepOnSelectedBatiment() {
    const stepCount = MAP.addStepOnSelectedBatiment();
    if (stepCount > 0) {
        const steps = document.querySelectorAll('.step');
        for (let i = 1; i < stepCount; i++) {
            steps[i].classList.remove('not-allow-step');
        }
        create3DMap();
    }
}

/**
 * Supprime le dernier étage du batiment sélectionné et change l'état du dernier div.step allow
 * MAX_STEP_COUNT = 5
 */
function removeLastStepOnSelectedBatiment() {
    const stepCount = MAP.removeLastStepOnSelectedBatiment();
    if (stepCount > 0) {
        const steps = document.querySelectorAll('.step');
        for (let i = 5; i >= stepCount; i--) {
            steps[i].classList.add('not-allow-step');
        }
        create3DMap();
    }
}

/**
 * Récupère l'index du batiment sélectionné et mets à jour l'objet MAP
 */
function selectBatiment() {
    const options = document.querySelectorAll('#batiment-list option');
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            if (options[i].value !== "none") {
                MAP.selectBatiment(i - 1);
                const stepCount = MAP.getSelectedBatiment().mur_int.step.length;
                if (stepCount > 0) {
                    const steps = document.querySelectorAll('.step');
                    for (let i = 0; i < steps.length; i++) {
                        if (i < stepCount) {
                            steps[i].classList.remove('not-allow-step');
                        } else {
                            steps[i].classList.add('not-allow-step');
                        }
                    }
                }
            }
            else {
                MAP.selectedBatiment = -1;
            }
            return;
        }
    }
}

function loadMapInfoFromURL(){
    const decode = decodeURI(window.location);
    MAP_ID = decode.split('?id=')[1].split('&name')[0];
    MAP_NAME = decode.split('&name=')[1];
    console.log(MAP_ID + " " + MAP_NAME);
}

function loadMapFromAPI(){
    request("http://localhost:3000/map/" + MAP_ID, "GET", {}, function(json){
        console.log(json);
    });
}

function main() {
    let offset = { x: 0, y: 0 };
    const canvas2DContainer = document.querySelector('.canvas-2d-container');
    canvas2DContainer.addEventListener('scroll', function (event) {
        offset.x = event.target.scrollLeft;
        offset.y = event.target.scrollTop;
    });

    const canvas2D = document.querySelector('.canvas-2d');
    const img = document.createElement('img');
    img.src  = 'http://127.0.0.1:3000/download/' + MAP_ID;
    
    canvas2D.width = img.width;
    canvas2D.height = img.height;
    canvas2D.style.backgroundImage ="url("+ img.src + ")";

    const ctx = canvas2D.getContext('2d');
    let pointSuivant = { x: 0, y: 0 };
    canvas2D.addEventListener('mousemove', function (event) {
        const mousex = event.x - 20 + offset.x;
        const mousey = event.y - 80 + offset.y;
        pointSuivant = { x: mousex, y: mousey };
        //Dessiner tous les batiments précédents
        ctx.beginPath();
       draw2D(ctx, pointSuivant, canvas2D);
    });

    canvas2D.addEventListener('click', function () {
        const currentBatiment = MAP.getSelectedBatiment();
        if (currentBatiment !== null) {
            currentBatiment.addPoint(pointSuivant);
            draw2D(ctx, pointSuivant, canvas2D);
            create3DMap();
        }
    });

    updateDrawSection();
    changeStep();

    window.addEventListener('keypress', function(event){
        console.log(event.keyCode);
        if(event.keyCode === 97){
            //Retirer le dernier point du batiment selectionné
            const batiment = MAP.getSelectedBatiment();
            if(batiment !== null){
                batiment.removeLastPoint();
                draw2D(ctx, pointSuivant, canvas2D);
            }
        }
    });
}

function draw2D(ctx, pointSuivant, canvas2D){
    ctx.clearRect(0, 0, canvas2D.clientWidth, canvas2D.clientHeight);
    for (let i = 0; i < MAP.batiments.length; i++) {
        const mursExterieurDuBatiments = MAP.batiments[i].mur_ext;
        for (let j = 0; j < mursExterieurDuBatiments.length - 1; j++) {
            ctx.moveTo(mursExterieurDuBatiments[j].x, mursExterieurDuBatiments[j].y);
            ctx.lineTo(mursExterieurDuBatiments[j + 1].x, mursExterieurDuBatiments[j + 1].y);
            ctx.stroke();
        }
        const murInterieurBatiment = MAP.batiments[i].mur_int;
        for (let j = 0; j < murInterieurBatiment.step[MAP.batiments[i].currentStep].length; j++) {
            const mur = murInterieurBatiment.step[MAP.batiments[i].currentStep][j];
            if (mur.length < 2)
                continue;
            ctx.moveTo(mur[0].x, mur[0].y);
            ctx.lineTo(mur[1].x, mur[1].y);
            ctx.stroke();
        }
    }

    const currentBatiment = MAP.getSelectedBatiment();
    if (currentBatiment !== null &&
        currentBatiment.drawSector === currentBatiment.CONTOUR &&
        currentBatiment.mur_ext.length > 0) {

        const mursDuBatiments = currentBatiment.mur_ext;
        ctx.moveTo(mursDuBatiments[mursDuBatiments.length - 1].x,
            mursDuBatiments[mursDuBatiments.length - 1].y);
        ctx.lineTo(pointSuivant.x, pointSuivant.y);
        ctx.stroke();
    } else if (currentBatiment !== null &&
        currentBatiment.drawSector === currentBatiment.INTERIEUR) {
        const murInterieurCourant = currentBatiment.getLastInnerWall();

        if (murInterieurCourant !== undefined && murInterieurCourant.length === 1) {
            ctx.moveTo(murInterieurCourant[0].x, murInterieurCourant[0].y);
            ctx.lineTo(pointSuivant.x, pointSuivant.y);
            ctx.stroke();
        }
    }
}

function updateDrawSection() {
    const radios = document.querySelectorAll('.draw-control input');
    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function (event) {
            if (MAP.selectedBatiment < 0) {
                return;
            }
            if (radios[i].checked) {
                MAP.getSelectedBatiment().setDrawSection(parseInt(radios[i].value, 10));
                console.log(MAP.getSelectedBatiment());
            }
        });
    }
}

function changeStep() {
    const steps = document.querySelectorAll('.step');
    for (let i = 0; i < steps.length; i++) {
        steps[i].addEventListener('click', function () {
            if (steps[i].classList.contains('not-allow-step') === false) {
                uncheckAllStep();
                steps[i].classList.add('current');
                MAP.setCurrentStepOfSelectedBatiment(i);
            }
        });
    }
}

function uncheckAllStep() {
    const steps = document.querySelectorAll('.step');
    for (let i = 0; i < steps.length; i++) {
        steps[i].classList.remove('current');
    }
}

/**
 * 
 * @param {String} url 
 * @param {String} method 
 * @param {Object} data 
 * @param {function} callback 
 */
function request(url, method, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(JSON.parse(this.responseText));
        }
    }
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}


//THREE JS
const canvas3D = document.querySelector('.canvas-3d');
const canvas2D = document.querySelector('.canvas-2d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfdeca6);
const camera = new THREE.PerspectiveCamera(60, canvas3D.clientWidth / canvas3D.clientHeight, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas3D });
renderer.setSize(canvas3D.clientWidth, canvas3D.clientHeight);

const control = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 10, 10);

const DEFAULT_WALL_HEIGHT = 0.75;
const DEFAULT_WALL_DEPTH = 0.05;

function create3DMap() {
    scene.remove.apply(scene, scene.children);
    for (let i = 0; i < MAP.batiments.length; i++) {
        create3DBatiment(MAP.batiments[i]);
    }
}

function create3DBatiment(batiment) {
    const group = new THREE.Group();
    for (let j = 0; j < batiment.mur_int.step.length; j++) {
        const ground = new THREE.Shape();
        for (let i = 0; i < batiment.mur_ext.length - 1; i++) {
            const p1 = normalize({ x: batiment.mur_ext[i].x, y: batiment.mur_ext[i].y });
            const p2 = normalize({ x: batiment.mur_ext[i + 1].x, y: batiment.mur_ext[i + 1].y });
            ground.moveTo(p1.x, p1.y);
            ground.lineTo(p2.x, p2.y);
            group.add(createMesh(p1, p2, j));
        }
        const geometry = new THREE.ShapeGeometry(ground);
        const material = new THREE.PointsMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -DEFAULT_WALL_HEIGHT / 2 + j * DEFAULT_WALL_HEIGHT;
        group.add(mesh);
        const current = batiment.currentStep;
        for (let i = 0; i < batiment.mur_int.step[j].length; i++) {
            if (batiment.mur_int.step[j][i].length === 2) {
                const p1 = normalize({
                    x: batiment.mur_int.step[j][i][0].x,
                    y: batiment.mur_int.step[j][i][0].y
                });
                const p2 = normalize({
                    x: batiment.mur_int.step[j][i][1].x,
                    y: batiment.mur_int.step[j][i][1].y
                });
                group.add(createMesh(p1, p2, j));
            }
        }
    }
    scene.add(group);
}

function createMesh(p1, p2, step) {
    const width = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    const height = DEFAULT_WALL_HEIGHT;
    const depth = DEFAULT_WALL_DEPTH;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const rot = rotation(p2, p1);
    const middle = middlePoint(p1, p2);
    mesh.position.x = middle.x;
    mesh.position.z = -middle.y;
    mesh.rotation.y = rot;
    mesh.position.y = step * DEFAULT_WALL_HEIGHT;
    return mesh;
}

function normalize(p) {
    const scale = 10;
    const p2 = { x: (p.x / canvas3D.clientWidth) * 2*scale - 1*scale, y: (p.y / canvas3D.clientHeight) * 2*scale + 1*scale };
    return p2;
}

function rotation(p1, p2) {
    return Math.atan((p1.y - p2.y) / (p1.x - p2.x));
}

function middlePoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

const animate = function () {
    requestAnimationFrame(animate);
    control.update();
    renderer.render(scene, camera);
}
animate();
