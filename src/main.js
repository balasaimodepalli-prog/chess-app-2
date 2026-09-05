import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const app = document.querySelector('#app')

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0f1118)
scene.fog = new THREE.Fog(0x0f1118, 26, 54)

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(9, 12, 11)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
app.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)
controls.minDistance = 8
controls.maxDistance = 24
controls.maxPolarAngle = Math.PI / 2.08

scene.add(new THREE.AmbientLight(0xffffff, 0.62))

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1)
keyLight.position.set(10, 18, 8)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
scene.add(keyLight)

const fillLight = new THREE.DirectionalLight(0x7fa4ff, 0.35)
fillLight.position.set(-8, 10, -12)
scene.add(fillLight)

const table = new THREE.Mesh(
  new THREE.CylinderGeometry(7.7, 8.4, 1.25, 42),
  new THREE.MeshStandardMaterial({ color: 0x2f1f17, roughness: 0.8, metalness: 0.1 })
)
table.position.y = -1.2
table.receiveShadow = true
scene.add(table)

const board = new THREE.Group()
scene.add(board)

const squares = []
const darkColor = new THREE.Color(0x4f5d75)
const lightColor = new THREE.Color(0xe8d9c5)

for (let row = 0; row < 8; row += 1) {
  for (let col = 0; col < 8; col += 1) {
    const isDark = (row + col) % 2 === 1
    const square = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.16, 1),
      new THREE.MeshStandardMaterial({
        color: isDark ? darkColor : lightColor,
        roughness: 0.86,
        metalness: 0.04,
      })
    )

    square.position.set(col - 3.5, -0.02, row - 3.5)
    square.receiveShadow = true
    square.userData = { baseColor: square.material.color.clone() }
    board.add(square)
    squares.push(square)
  }
}

const pieceMaterial = {
  white: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.38, metalness: 0.05 }),
  black: new THREE.MeshStandardMaterial({ color: 0x131722, roughness: 0.42, metalness: 0.12 }),
}

const createPiece = (kind, color) => {
  const group = new THREE.Group()
  const material = pieceMaterial[color]

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.16, 24), material)
  base.position.y = 0.08
  base.castShadow = true
  group.add(base)

  const bodyHeight = kind === 'pawn' ? 0.44 : 0.6
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, bodyHeight, 20), material)
  body.position.y = 0.16 + bodyHeight / 2
  body.castShadow = true
  group.add(body)

  if (kind === 'rook') {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 6), material)
    top.position.y = 0.86
    top.castShadow = true
    group.add(top)
  } else if (kind === 'bishop') {
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), material)
    top.position.y = 0.87
    top.castShadow = true
    group.add(top)
  } else if (kind === 'queen') {
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 24), material)
    crown.position.y = 0.92
    crown.rotation.x = Math.PI / 2
    crown.castShadow = true
    group.add(crown)

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), material)
    orb.position.y = 1.03
    orb.castShadow = true
    group.add(orb)
  } else if (kind === 'king') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.06), material)
    top.position.y = 1
    top.castShadow = true
    group.add(top)

    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), material)
    cross.position.y = 1.03
    cross.castShadow = true
    group.add(cross)
  } else if (kind === 'knight') {
    const neck = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.36, 4), material)
    neck.position.set(0, 0.86, 0.03)
    neck.rotation.z = Math.PI / 12
    neck.castShadow = true
    group.add(neck)
  } else {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 18), material)
    head.position.y = 0.79
    head.castShadow = true
    group.add(head)
  }

  group.userData = { kind, color }
  return group
}

const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

const addPiece = (kind, color, row, col) => {
  const piece = createPiece(kind, color)
  piece.position.set(col - 3.5, 0.07, row - 3.5)
  board.add(piece)
}

for (let col = 0; col < 8; col += 1) {
  addPiece(backRank[col], 'white', 0, col)
  addPiece('pawn', 'white', 1, col)
  addPiece('pawn', 'black', 6, col)
  addPiece(backRank[col], 'black', 7, col)
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let hoveredSquare = null

const setHoveredSquare = (next) => {
  if (hoveredSquare === next) return

  if (hoveredSquare) {
    hoveredSquare.material.color.copy(hoveredSquare.userData.baseColor)
  }

  hoveredSquare = next

  if (hoveredSquare) {
    hoveredSquare.material.color.offsetHSL(0, 0, -0.12)
  }
}

const onPointerMove = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const [hit] = raycaster.intersectObjects(squares)
  setHoveredSquare(hit ? hit.object : null)
}

window.addEventListener('pointermove', onPointerMove)
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const hud = document.createElement('div')
hud.className = 'hud'
hud.textContent = '3D Chess Demo · Drag to orbit · Scroll to zoom · Hover squares'
document.body.appendChild(hud)

const clock = new THREE.Clock()

const animate = () => {
  requestAnimationFrame(animate)

  const t = clock.getElapsedTime()
  board.rotation.y = Math.sin(t * 0.2) * 0.05

  controls.update()
  renderer.render(scene, camera)
}

animate()
