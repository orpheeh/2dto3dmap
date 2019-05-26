const new_batiment_btn = document.querySelector('#new-batiment');
const begin_draw = document.querySelector('#begin-draw');
const stop_draw = document.querySelector('#stop-draw');
const select_batiment = document.querySelector('#select-bat');
const delete_bat = document.querySelector('#delete-bat');
const canvas2D = document.querySelector('.canvas-2d');
const canvas3D = document.querySelector('.canvas-3d');

const add_step = document.querySelector('#new-step');
const remove_step = document.querySelector('#delete-step');

canvas2D.width = canvas2D.clientWidth;
canvas2D.height = canvas2D.clientHeight;
canvas3D.width = canvas3D.clientWidth;
canvas3D.height = canvas3D.clientHeight;

window.onload = function () {
    const radios = document.querySelectorAll('.draw-control input');
    console.log('change draw sector 1');

    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('click', function () {
            drawSector = i;
            console.log('change draw sector');
        });
    }
}

/* {
    murs_ext: [ {}, {}, ... ]
    murs_int: { step: [ [{p1:{}, p2:{}}, ...], .... ],  current_step: 0 }
}*/
const LES_BATIMENTS = [];
let pointSuivant = undefined;
let indexBatimentCourant = -1;

const EXTERIEUR = 0;
const INTERIEUR = 1;
let drawSector = EXTERIEUR;
let murInterieurCourant = [];

//Dessin dans le canvas  2D
const ctx = canvas2D.getContext('2d');
ctx.strokeText('Position de la souris: ( ... , ... )', 20, 20, 200);

canvas2D.addEventListener('mousemove', function (event) {
    const mousex = event.x - 20;
    const mousey = event.y - 80;

    //Montrer la position de la souris
    ctx.clearRect(0, 0, canvas2D.clientWidth, canvas2D.clientHeight);
    ctx.strokeStyle = '#083e69';
    ctx.strokeText('Position de la souris: (' + mousex + ', ' + mousey + ')', 20, 20, 200);

    pointSuivant = { x: mousex, y: mousey };

    //Dessiner tous les batiments précédents
    ctx.beginPath();

    for (let i = 0; i < LES_BATIMENTS.length; i++) {
        const mursExterieurDuBatiments = LES_BATIMENTS[i].mur_ext;
        for (let j = 0; j < mursExterieurDuBatiments.length - 1; j++) {
            ctx.moveTo(mursExterieurDuBatiments[j].x, mursExterieurDuBatiments[j].y);
            ctx.lineTo(mursExterieurDuBatiments[j + 1].x, mursExterieurDuBatiments[j + 1].y);
            ctx.stroke();
        }

        const murInterieurBatiment = LES_BATIMENTS[i].mur_int;
        for (let j = 0; j < murInterieurBatiment.step[murInterieurBatiment.current].length; j++) {
            console.log('redessinage des mur interieur ' + j);
            const mur = murInterieurBatiment.step[murInterieurBatiment.current][j];
            ctx.moveTo(mur[0].x, mur[0].y);
            ctx.lineTo(mur[1].x, mur[1].y);
            ctx.stroke();
        }
    }

    if (drawSector === EXTERIEUR &&
        indexBatimentCourant >= 0 && LES_BATIMENTS[indexBatimentCourant].mur_ext.length > 0) {
        const mursDuBatiments = LES_BATIMENTS[indexBatimentCourant].mur_ext;

        ctx.moveTo(mursDuBatiments[mursDuBatiments.length - 1].x,
            mursDuBatiments[mursDuBatiments.length - 1].y);
        ctx.lineTo(pointSuivant.x, pointSuivant.y);
        ctx.stroke();
    } else if (drawSector === INTERIEUR && murInterieurCourant.length === 1) {
        ctx.moveTo(murInterieurCourant[0].x, murInterieurCourant[0].y);
        ctx.lineTo(pointSuivant.x, pointSuivant.y);
        ctx.stroke();
    }
});

canvas2D.addEventListener('click', function () {
    if (indexBatimentCourant >= 0) {
        if (drawSector === EXTERIEUR) {
            LES_BATIMENTS[indexBatimentCourant].mur_ext.push(pointSuivant);
        }
        //Gestion de l'interieur du batiment
        if (drawSector === INTERIEUR) {
            if (murInterieurCourant.length < 2) {
                murInterieurCourant.push(pointSuivant);
            }
            if (murInterieurCourant.length === 2) {
                const batimentStep = LES_BATIMENTS[indexBatimentCourant].mur_int;
                batimentStep.step[batimentStep.current].push(murInterieurCourant);
                murInterieurCourant = [];
                console.log("ADD mur");
            }

        }
        //Dessiner en 3D
        create3DMap();
    }
});

new_batiment_btn.addEventListener('click', function () {
    LES_BATIMENTS.push({
        mur_ext: [],
        mur_int: { step: [[]], current: 0 }
    });
    const option = document.createElement('option');
    option.value = LES_BATIMENTS.length - 1 + '';
    option.innerHTML = 'Batiment ' + LES_BATIMENTS.length;
    select_batiment.appendChild(option);
    if (LES_BATIMENTS.length === 1) {
        delete_bat.classList.remove('btn-off');
    }

});

delete_bat.addEventListener('click', function () {
    console.log(select_batiment.value);
    if (select_batiment.value !== 'none') {
        const option = document.querySelector('#select-bat option[ value="' + select_batiment.value + '"]');
        LES_BATIMENTS.splice(parseInt(select_batiment.value), 1);
        select_batiment.removeChild(option);
        if (LES_BATIMENTS.length === 0) {
            delete_bat.classList.add('btn-off');
        }
    }
});

function clearRadioContainer() {
    const myNode = document.querySelector('.radio-container');
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

select_batiment.addEventListener('change', function (event) {
    console.log('SELECT CHANGE ' + select_batiment.value);
    if (select_batiment.value !== 'none') {
        document.querySelector('.step-control').classList.remove('no-display');
        indexBatimentCourant = parseInt(select_batiment.value);
        const batimentStep = LES_BATIMENTS[indexBatimentCourant].mur_int;
        const stepCount = batimentStep.step.length;
        clearRadioContainer();
        for (let i = 0; i < stepCount; i++) {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.value = i;
            radio.name = 'step';
            radio.checked = true;
            batimentStep.current = i;
            radio.title = 'Etage ' + i;
            document.querySelector('.radio-container').appendChild(radio);
            radio.addEventListener('click', function () {
                batimentStep.current = i;
                console.log("etage courant : " + batimentStep.current);
            });
        }
    } else {
        document.querySelector('.step-control').classList.add('no-display');
        indexBatimentCourant = -1;
    }
});

add_step.addEventListener('click', function () {
    if (indexBatimentCourant >= 0) {
        const batimentStep = LES_BATIMENTS[indexBatimentCourant].mur_int;
        batimentStep.step.push([]);
        const i = batimentStep.step.length - 1;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = i;
        radio.name = 'step';
        radio.checked = true;
        radio.title = 'Etage ' + i;
        batimentStep.current = i;
        document.querySelector('.radio-container').appendChild(radio);
        radio.addEventListener('click', function () {
            batimentStep.current = i;
            console.log("etage courant : " + batimentStep.current);
        });
    }
});

remove_step.addEventListener('click', function () {
    if (indexBatimentCourant >= 0) {
        const batimentStep = LES_BATIMENTS[indexBatimentCourant].mur_int;
        batimentStep.step.pop();
        batimentStep.current = batimentStep.step.length - 1;
        const radio_container = document.querySelector('.radio-container');
        radio_container.removeChild(radio_container.children[radio_container.children.length - 1]);
        radio_container.lastChild.checked = true;
    }
});

//THREE JS

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas3D.clientWidth / canvas3D.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas3D });
renderer.setSize(canvas3D.clientWidth, canvas3D.clientHeight);

const control = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 10, 10);

const DEFAULT_WALL_HEIGHT = 0.5;
const DEFAULT_WALL_DEPTH = 0.05;

function create3DMap() {
    scene.remove.apply(scene, scene.children);
    for (let i = 0; i < LES_BATIMENTS.length; i++) {
        create3DBatiment(LES_BATIMENTS[i]);
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
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -DEFAULT_WALL_HEIGHT / 2 + j*DEFAULT_WALL_HEIGHT;
        group.add(mesh);
        const current = batiment.mur_int.current;
        for (let i = 0; i < batiment.mur_int.step[j].length; i++) {
            const p1 = normalize({ x: batiment.mur_int.step[current][i][0].x, y: batiment.mur_int.step[current][i][0].y });
            const p2 = normalize({ x: batiment.mur_int.step[current][i][1].x, y: batiment.mur_int.step[current][i][1].y });
            group.add(createMesh(p1, p2, j));
        }
    }
    scene.add(group);
}

function createMesh(p1, p2, step) {
    const width = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    const height = DEFAULT_WALL_HEIGHT;
    const depth = DEFAULT_WALL_DEPTH;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
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
    return { x: (p.x / canvas3D.clientWidth) * 2 - 1, y: (p.y / canvas3D.clientHeight) * 2 + 1 };
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
