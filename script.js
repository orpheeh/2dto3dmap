const new_batiment_btn = document.querySelector('#new-batiment');
const begin_draw = document.querySelector('#begin-draw');
const stop_draw = document.querySelector('#stop-draw');
const select_batiment = document.querySelector('#select-bat');
const delete_bat = document.querySelector('#delete-bat');

const canvas2D = document.querySelector('.canvas-2d');
const canvas3D = document.querySelector('.canvas-3d');

canvas2D.width = canvas2D.clientWidth;
canvas2D.height = canvas2D.clientHeight;

canvas3D.width = canvas3D.clientWidth;
canvas3D.height = canvas3D.clientHeight;

/* {
    murs_ext: [ {}, {}, ... ]
    murs_secondaire: [ [{}, {}], ... ]
}*/
const LES_BATIMENTS = [];
let pointSuivant = undefined;
let indexBatimentCourant = -1;

//Dessin dans le canvas  2D
const ctx = canvas2D.getContext('2d');
ctx.strokeText('Position de la souris: ( ... , ... )', 20, 20, 200);

canvas2D.addEventListener('mousemove', function(event){
    const mousex = event.x - 20;
    const mousey = event.y - 80;

    indexBatimentCourant = select_batiment.value === 'none' ?
     -1 : parseInt(select_batiment.value);

    //Montrer la position de la souris
    ctx.clearRect(0, 0, canvas2D.clientWidth, canvas2D.clientHeight);
    ctx.strokeStyle = '#083e69';
    ctx.strokeText('Position de la souris: (' + mousex + ', ' + mousey + ')', 20, 20, 200);

    pointSuivant = { x: mousex, y: mousey };

    //Dessiner tous les batiments précédents
    ctx.beginPath();

    for(let i = 0; i < LES_BATIMENTS.length; i++){
        const mursExterieurDuBatiments = LES_BATIMENTS[i].mur_ext;
        for(let j = 0; j < mursExterieurDuBatiments.length-1; j++){
            ctx.moveTo(mursExterieurDuBatiments[j].x, mursExterieurDuBatiments[j].y);
            ctx.lineTo(mursExterieurDuBatiments[j+1].x, mursExterieurDuBatiments[j+1].y);
            ctx.stroke();
        }
    }

    if(indexBatimentCourant >= 0 && LES_BATIMENTS[indexBatimentCourant].mur_ext.length > 0) {
        const mursDuBatiments = LES_BATIMENTS[indexBatimentCourant].mur_ext;

        ctx.moveTo(mursDuBatiments[mursDuBatiments.length - 1].x,
            mursDuBatiments[mursDuBatiments.length - 1].y);
        ctx.lineTo(pointSuivant.x, pointSuivant.y);
        ctx.stroke();
    }
});

canvas2D.addEventListener('click', function () {
    console.log(LES_BATIMENTS);
    if(indexBatimentCourant >= 0){
        LES_BATIMENTS[indexBatimentCourant].mur_ext.push(pointSuivant);
    }
});

new_batiment_btn.addEventListener('click', function() {
    console.log('ajouter nouveau batiment');
    LES_BATIMENTS.push( { mur_ext: [], mur_int: [] });
    const option = document.createElement('option');
    option.value = LES_BATIMENTS.length-1 + '';
    option.innerHTML = 'Batiment ' + LES_BATIMENTS.length;
    option.selected = true;
    select_batiment.appendChild(option);
    if(LES_BATIMENTS.length === 1){
        delete_bat.classList.remove('btn-off');
    }

});

delete_bat.addEventListener('click', function(){
    console.log(select_batiment.value);
    if(select_batiment.value !== 'none'){
        const option = document.querySelector('#select-bat option[ value="' + select_batiment.value + '"]');
        LES_BATIMENTS.splice(parseInt(select_batiment.value), 1);
        select_batiment.removeChild(option);
        if(LES_BATIMENTS.length === 0){
            delete_bat.classList.add('btn-off');
        }
    }
});

//THREE JS

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas3D.clientWidth / canvas3D.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer( { canvas: canvas3D } );
renderer.setSize(canvas3D.clientWidth, canvas3D.clientHeight);

const control = new THREE.OrbitControls(camera);

//Draw geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const animate = function(){
    requestAnimationFrame(animate);
    control.update();
    //update();
    renderer.render(scene, camera);
}
animate();
