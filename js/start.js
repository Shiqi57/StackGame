let camera, scene, renderer;
let level;
const cubeH = 0.5;
let gameStarted = false;
let stack = [];
let direction;
var speed = 0.1;

const scoreText = document.getElementById("score");
const resultText = document.getElementById("result");
const finalScore = document.getElementById("finalScore");
const intro = document.getElementById("intro");

scoreText.style.display = "none";
resultText.style.display = "none";
var score = 0;

init();
window.addEventListener("click", ()=> {
    if(!gameStarted){
        renderer.setAnimationLoop(animation);
        gameStarted = true;
        //scoreText.style.display = "flex";
        //intro.style.display = "none";
        newGame();
       
    } else {
        const topLevel = stack[stack.length - 1];
        const direction = topLevel.direction;
        const lastLevel = stack[stack.length - 2];
        const overHang = topLevel.newCube.position[direction] - lastLevel.newCube.position[direction];

        const pos = direction == "x" ? topLevel.width : topLevel.depth;
        const overlap = pos - Math.abs(overHang);

        if(overlap > 0){
            //cut
            const newW = direction == "x"? overlap : topLevel.width;
            const newD = direction == "z"? overlap : topLevel.depth;
            const oldColor = topLevel.newCube.material.color;
            //console.log(newColor);
            
            topLevel.width = newW;
            topLevel.depth = newD;
            const currentP = topLevel.newCube.position[direction];

            topLevel.newCube.scale[direction] = overlap / pos;
            topLevel.newCube.position[direction] -= overHang / 2;

            //create sliced
            //const slicedEdge = pos - overlap;
            let slicedCube;
            if(direction == "x"){
                slicedCube = createCube(lastLevel.newCube.position.x + Math.sign(overHang) * (Math.abs(overHang) / 2 + lastLevel.width / 2), topLevel.newCube.position.y, topLevel.newCube.position.z, Math.abs(overHang), topLevel.depth, oldColor);
                //slicedCube.newCube.material.color.set("blue");
            }else {
                slicedCube = createCube(topLevel.newCube.position.x, topLevel.newCube.position.y, lastLevel.newCube.position.z + Math.sign(overHang) * ( Math.abs(overHang) / 2 + lastLevel.depth / 2), topLevel.width, Math.abs(overHang), oldColor);
            }
            drop(slicedCube.newCube, direction);

            //next
            const newX = direction == "x" ? topLevel.newCube.position.x : -7;
            const newZ = direction == "z" ? topLevel.newCube.position.z : -7;
            const nextDirection = direction == "x" ? "z" : "x";

            const color1 = newColor();
            newLevel(newX, newZ, newW, newD, color1, nextDirection);

            score++;
            
            scoreText.innerText = "Score: " + score;
        }else {
            drop(topLevel.newCube)
            gsap.to(camera, {
                zoom: 0.5,
                duration: 2,
                ease: "back.out(2)",
                onUpdate() {
                  camera.updateProjectionMatrix();
                }
            });
            showResult(score);

        }

        updateCamera();
        
    }
});

function animation() {
    const topLevel = stack[stack.length - 1];
    topLevel.newCube.position[topLevel.direction] += speed;
    if(Math.abs(topLevel.newCube.position[topLevel.direction]) > 7) {  
        speed = speed * -1;
        console.log(this.speed);
     }

    renderer.render(scene, camera);  
}
function updateCamera(){
    if (camera.position.y < cubeH * (stack.length - 2) + 4) {
        //camera.position.y += speed;
        gsap.to(camera.position, {
            y: camera.position.y+0.5,
            duration: 1.4,
          });
      }
}

function init() {
    //Scene

    scene = new THREE.Scene();

    //Add block

    // const geometry = new THREE.BoxGeometry(3,1,3);
    // const material = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0, -1, 0);
    // scene.add(mesh);

    newLevel(0, 0, 2, 2, newColor());

    //add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dLight.position.set(10, 20, 0);
    scene.add(dLight);

    //add camera
    const aspect = window.innerWidth / window.innerHeight;
    const width = 10;
    const height = width / aspect;
    camera = new THREE.OrthographicCamera(
        width / -2, // left
        width / 2, // right
        height / 2, // top
        height / -2, // bottom
        0, // near plane
        100 // far plane
    );

    camera.position.set(3,1,3);
    camera.lookAt(0, 0, 0);
    

    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('#428bca', 1);
    //renderer.setAnimationLoop(animation);
    renderer.render(scene, camera);
    document.body.appendChild(renderer.domElement);


}


function createCube(x, y, z, width, depth, color) {
    const geometry = new THREE.BoxGeometry(width, cubeH, depth);
    //const random = Math.random() * 0xffffff;
    
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    return {
        newCube:mesh,
        width,
        depth
    };

}

function newLevel(x, z, width, depth, color, direction) {
    const y = cubeH * stack.length; // Add the new box one layer higher
    const level = createCube(x, y, z, width, depth, color);
    level.direction = direction;
    stack.push(level);
}

function newColor(){
    const random = Math.random() * 0xffffff;
    return random;
}

function drop(cube, direction) {
    gsap.to(cube.position, {
        y: "-= 20",
        ease: "power1.easeIn",
        duration: 4.5,
        onComplete() {
          scene.remove(cube);
        },
      });
    gsap.to(cube.rotation, {
        delay: 0.1,
        x: direction == "z" ? 4 : 0.1,
        y: 0.1,
        z: direction == "x" ? -4 : 0.1,
        duration: 1.5,
      });
}

function showResult(score){
    resultText.style.display = "flex";
    scoreText.style.display = "none";
    finalScore.innerText = "Your score is " + score;
    window.addEventListener("click", ()=> {
        location.reload();
    })

}

function newGame(){
    newLevel(-7, 0, 2, 2, newColor(), "x");
    gsap.fromTo(scoreText, {
        y: 0,
        opacity: 0,
    },{
        y: 30,
        opacity:1,
        duration: 1,
        onUpdate(){
            scoreText.style.display = "flex"
        }
    })
    gsap.to(intro, {
        duration:0.8,
        opacity: 0,
        onComplete(){
            intro.style.display = "none"
        } 
    })
    gsap.to(camera.position, {
        y: 3,
        duration: 1.5,
        onUpdate(){
            camera.lookAt(0, 0, 0)
        }
      });
    gsap.to(camera.position, {
        y: 4,
        duration: 1.5,
      });
}