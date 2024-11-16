import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Base
 */
// Debug
const gui = new GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
    size: 0.001,
    count: 0,
    galaxyRadius: 0,
    galaxyBranches: 3,
    galaxySpinAngle: 1,
    galaxyRandomness: 0.2,
    galaxyRandomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: "#1b3984"
}

let particleGeometry = null
let particleMaterial = null
let galaxyParticle = null

const generateGalaxy = () => {

    /**
     * Destroy old galaxy
     */
    if (galaxyParticle != null) {
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(galaxyParticle)
    }
    /**
     * Geometry
     */
    particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3) // for [x,y,z...]
    const colors = new Float32Array(parameters.count * 3 )

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    console.log(colorInside);
    

    for (let i = 0; i < parameters.count; i++) { // set random position for every particle


        const i3 = i * 3

        //Position

        const radius = Math.random() * parameters.galaxyRadius
        const spinAngle = radius * parameters.galaxySpinAngle
        const branchAngle = ((i % parameters.galaxyBranches) / parameters.galaxyBranches) * (Math.PI * 2);

        const randomX = Math.pow(Math.random(), parameters.galaxyRandomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.galaxyRandomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.galaxyRandomnessPower) * (Math.random() < 0.5 ? 1 : -1)


        positions[i3 + 0] = Math.cos(branchAngle + (spinAngle)) * radius + randomX // x axis
        positions[i3 + 1] = randomY // y axis
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ// z axis

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.galaxyRadius)

        
        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b


    }

    /**
     * Material
     */

    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
    })

    galaxyParticle = new THREE.Points(particleGeometry, particleMaterial)
    particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    particleGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    )

    scene.add(galaxyParticle)
}
generateGalaxy()

/** GUI DEBUG */
const particleFolder = gui.addFolder("Particles")
particleFolder.add(parameters, 'count').min(0).max(10000).step(1).name("Particle Count").onChange(generateGalaxy)
particleFolder.add(parameters, 'size').min(0).max(.05).step(0.001).name("Particle Size").onChange(generateGalaxy)

const galaxyFolder = gui.addFolder("Galaxy")
galaxyFolder.add(parameters, "galaxyRadius").min(0).max(20).step(.01).name("Galaxy Radius").onChange(generateGalaxy)
galaxyFolder.add(parameters, "galaxyBranches").min(2).max(20).step(1).name("Galaxy Branches").onChange(generateGalaxy)
galaxyFolder.add(parameters, "galaxySpinAngle").min(-5).max(5).step(0.01).name("Galaxy Spin").onChange(generateGalaxy)
galaxyFolder.add(parameters, "galaxyRandomness").min(0).max(2).step(0.001).name("Galaxy Randomness").onChange(generateGalaxy)
galaxyFolder.add(parameters, "galaxyRandomnessPower").min(0).max(10).step(0.001).name("Galaxy Randomness Power").onChange(generateGalaxy)
galaxyFolder.addColor(parameters,"insideColor").name("Galaxy Inside Color").onChange(generateGalaxy)
galaxyFolder.addColor(parameters,"outsideColor").name("Galaxy Outside Color").onChange(generateGalaxy)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 5
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    /**Animate galaxy moving */
    galaxyParticle.rotation.y = elapsedTime * 0.1



    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// Animate galaxy raduis
gsap.to(parameters, {
    galaxyRadius: 8,
    duration: 5,
    ease: "power4.inOut",
    onUpdate: generateGalaxy
})
gsap.to(parameters, {
    galaxyRandomnessPower: 3,
    delay: 5,
    duration: 5,
    ease: "power4.inOut",
    onUpdate: generateGalaxy
})



gsap.to(parameters, {
    count: 100000,
    delay: 0,
    duration: 5,
    ease: "power1.inOut",
    onUpdate: generateGalaxy
})

gui.close()
