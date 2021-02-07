const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const white = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
const black = new THREE.MeshPhongMaterial( { color: 0x000000, flatShading: true } );
scene.background = new THREE.Color( 0xcccccc );

const light = new THREE.PointLight( 0xffffff, 4, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );

const keys = [];
const blackNumbers = [2,5,7,10,12];
const noteNumber = {
    "A": 1,
    "A#": 2,
    "B": 3,
    "C": 4,
    "C#": 5,
    "D": 6,
    "D#": 7,
    "E": 8,
    "F": 9,
    "F#": 10,
    "G": 11,
    "G#": 12
};

function getXTotal(){
    let total = 0;
    for(i = 0; i < keys.length; i++){
        let key = keys[i];
        total += key.scale.x;
    }
    return total;
}
function createKey(){
    let material;
    let isBlack = blackNumbers.find(element => element == (keys.length + 1) % 12);
    if(isBlack) {
        material = black;
    }
    else{
        material = white;
    }
    const key = new THREE.Mesh( geometry, material );
    key.scale.x = key.scale.y/2;
    key.scale.z = 2
    key.position.x = -2.5 + getXTotal();
    if(isBlack){
        key.scale.x /= 2;
        key.scale.y = 1;
        key.scale.z = 1;
        key.translateZ(-0.5);
        key.position.x -= key.scale.x / 2;
        key.position.y = 0.1;
    }
    
    
    keys.push(key);
    scene.add( key );
}



for(let i = 0; i < 88; i++){
    createKey();
}

camera.position.z = 15;
camera.position.x = 15;

function pressKey(idx, bool){
    let key = keys[idx];
    let val = 1;
    if(bool){
        key.position.y -= 0.1;
    }
    else{
        key.position.y += 0.1;
    }
    
  
}

controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target.set( 15, 0, 0 );
controls.enabled = true;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    controls.update();
    
}
animate();

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

let url = getParameterByName("url");

async function start(){
    const synths = [];
    const midi = await Midi.fromUrl(url || "https://bitmidi.com/uploads/81798.mid");

    const now = Tone.now() + 0.5;
    console.log(midi);
    midi.tracks.forEach((track) => {
        //create a synth for each track
        const synth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.15,
                release: 2,
            },
        }).toDestination();
        synths.push(synth);
        //schedule all of the events
        track.notes.forEach((note) => {
            //console.log(note.name);
            synth.triggerAttackRelease(
                note.name,
                note.duration,
                note.time + now,
                note.velocity
            );
            setTimeout(() => {
                console.log(note.name);
                let num = noteNumber[note.name.slice(0, -1)] * parseInt(note.name.charAt(note.name.length-1));
                console.log(num);
                pressKey(num, true);
                setTimeout(() => {
                    pressKey(num, false);
                }, note.duration*1000)
            }, (note.time)*1000)
        });
    });
}


window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener('keypress', start);
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
alert('Press a key to begin.\nIf you want the piano to play something else, add ?url=link_to_midi to play the desired midi.');