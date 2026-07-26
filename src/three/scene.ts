import * as THREE from 'three'

export class Scene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  particles: THREE.Points | null = null
  meshes: THREE.Mesh[] = []
  trees: THREE.Group[] = []
  animationId: number | null = null
  mousePos = { x: 0, y: 0 }
  particleSizes: Float32Array | null = null
  originalSizes: Float32Array | null = null
  time = 0

  constructor(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)

    // Camera setup
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 30

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true

    this.initScene()
    this.handleResize()
    this.setupMouseTracking()
  }

  private initScene() {
    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.scene.add(ambientLight)

    // Primary cyan light
    const pointLight = new THREE.PointLight(0x00d9ff, 1.5)
    pointLight.position.set(25, 25, 20)
    pointLight.castShadow = true
    this.scene.add(pointLight)

    // Magenta accent light
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8)
    pointLight2.position.set(-25, -25, 15)
    this.scene.add(pointLight2)

    // Moving light for extra depth
    const pointLight3 = new THREE.PointLight(0x00ffff, 0.5)
    pointLight3.position.set(0, 0, 30)
    this.scene.add(pointLight3)

    // Create particles
    this.createParticles()

    // Create multiple rotating meshes
    this.createMeshes()

    // Create trees
    this.createTrees()
  }

  private createParticles() {
    const particleCount = 1000 // Reduced from 1500
    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const originalSizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      positions[idx] = (Math.random() - 0.5) * 120
      positions[idx + 1] = (Math.random() - 0.5) * 120
      positions[idx + 2] = (Math.random() - 0.5) * 120

      velocities[idx] = (Math.random() - 0.5) * 0.4
      velocities[idx + 1] = (Math.random() - 0.5) * 0.4
      velocities[idx + 2] = (Math.random() - 0.5) * 0.4

      const size = Math.random() * 0.8 + 0.3
      sizes[i] = size
      originalSizes[i] = size
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    })

    this.particles = new THREE.Points(geometry, material)
    this.particleSizes = sizes
    this.originalSizes = originalSizes
    this.scene.add(this.particles)
  }

  private createMeshes() {
    // Main icosahedron
    const geo1 = new THREE.IcosahedronGeometry(15, 6)
    const mat1 = new THREE.MeshPhongMaterial({
      color: 0x00d9ff,
      wireframe: false,
      transparent: true,
      opacity: 0.15,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.3,
    })
    const mesh1 = new THREE.Mesh(geo1, mat1)
    mesh1.position.set(0, 0, 0)
    this.scene.add(mesh1)
    this.meshes.push(mesh1)

    // Rotating octahedron
    const geo2 = new THREE.OctahedronGeometry(12, 2)
    const mat2 = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      wireframe: false,
      transparent: true,
      opacity: 0.1,
      emissive: 0xff00ff,
      emissiveIntensity: 0.2,
    })
    const mesh2 = new THREE.Mesh(geo2, mat2)
    mesh2.position.set(15, 15, -10)
    this.scene.add(mesh2)
    this.meshes.push(mesh2)

    // Counter-rotating tetrahedron
    const geo3 = new THREE.TetrahedronGeometry(10, 1)
    const mat3 = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      wireframe: false,
      transparent: true,
      opacity: 0.08,
      emissive: 0x00ffff,
      emissiveIntensity: 0.15,
    })
    const mesh3 = new THREE.Mesh(geo3, mat3)
    mesh3.position.set(-15, -15, -5)
    this.scene.add(mesh3)
    this.meshes.push(mesh3)
  }

  private createTrees() {
    // Simplified tree creation using basic geometries
    const createSimpleTree = (x: number, y: number, z: number) => {
      const treeGroup = new THREE.Group()
      treeGroup.position.set(x, y, z)

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 6, 5)
      const trunkMat = new THREE.MeshPhongMaterial({
        color: 0x1e4d3e,
        transparent: true,
        opacity: 0.6,
      })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 3
      treeGroup.add(trunk)

      // Foliage - layered cones
      const foliageMat = new THREE.MeshPhongMaterial({
        color: 0x00aa66,
        transparent: true,
        opacity: 0.55,
        emissive: 0x003d24,
        emissiveIntensity: 0.1,
      })

      // Layer 1
      const cone1 = new THREE.ConeGeometry(3, 4, 6)
      const foliage1 = new THREE.Mesh(cone1, foliageMat)
      foliage1.position.y = 6
      treeGroup.add(foliage1)

      // Layer 2
      const cone2 = new THREE.ConeGeometry(2.2, 3.5, 6)
      const foliage2 = new THREE.Mesh(cone2, foliageMat.clone())
      foliage2.position.y = 7.5
      treeGroup.add(foliage2)

      // Layer 3 (top)
      const cone3 = new THREE.ConeGeometry(1.5, 2.5, 6)
      const foliage3 = new THREE.Mesh(cone3, foliageMat.clone())
      foliage3.position.y = 8.5
      treeGroup.add(foliage3)

      this.scene.add(treeGroup)
      this.trees.push(treeGroup)
    }

    // Create 3 trees
    createSimpleTree(-40, -50, -30)
    createSimpleTree(45, -45, -25)
    createSimpleTree(0, -55, -50)
  }

  private handleResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth
      const height = window.innerHeight

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    })
  }

  private setupMouseTracking() {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
  }

  animate(scrollProgress: number, scrollVelocity: number = 0) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    const tick = () => {
      this.time += 0.016 // ~60fps

      // Animate multiple meshes with different patterns
      if (this.meshes.length > 0) {
        // Main mesh - smooth rotation + scroll-based scaling
        this.meshes[0].rotation.x += 0.00015 + scrollVelocity * 0.0002
        this.meshes[0].rotation.y += 0.00025 + scrollVelocity * 0.0003
        const scale0 = 1 + Math.sin(this.time * 0.5) * 0.08 + scrollProgress * 0.15
        this.meshes[0].scale.z = scale0

        // Second mesh - faster counter rotation + scroll influence
        this.meshes[1].rotation.x -= 0.0003 + scrollVelocity * 0.0001
        this.meshes[1].rotation.y += 0.00015 + scrollVelocity * 0.0002
        this.meshes[1].rotation.z += 0.0002
        const scale2 = 0.8 + Math.sin(this.time * 0.7 + 2 + scrollProgress * 4) * 0.12 + scrollVelocity * 0.2
        this.meshes[1].scale.set(scale2, scale2, scale2)

        // Third mesh - wobble + scroll distortion
        this.meshes[2].rotation.x += 0.0002 + scrollVelocity * 0.00015
        this.meshes[2].rotation.y -= 0.00035 + scrollProgress * 0.002
        this.meshes[2].rotation.z += Math.sin(this.time * 0.3 + scrollProgress * 2) * 0.01
        const offsetY = Math.sin(this.time * 0.4) * 8 + scrollProgress * 20
        const offsetX = Math.cos(scrollProgress * 3) * 10
        this.meshes[2].position.set(offsetX, -15 + offsetY, -5)
      }

      // Animate trees with subtle sway and scroll influence
      if (this.trees.length > 0) {
        this.trees.forEach((tree, treeIdx) => {
          tree.rotation.z = Math.sin(this.time * 0.08 + treeIdx * 1.5) * 0.015 + scrollVelocity * 0.005
          tree.rotation.x = Math.cos(this.time * 0.1 + treeIdx * 1.2) * 0.01 + scrollProgress * 0.03
          tree.position.y = -55 + treeIdx * 2 + Math.sin(this.time * 0.06 + treeIdx) * 2 + scrollProgress * 25
        })
      }

      // Animate particles with mouse + scroll interaction
      if (this.particles && this.particleSizes && this.originalSizes) {
        const positions = this.particles.geometry.attributes.position.array as Float32Array
        const velocities = this.particles.geometry.attributes.velocity.array as Float32Array
        const sizes = this.particles.geometry.attributes.size.array as Float32Array

        const mouseX = this.mousePos.x * 40
        const mouseY = this.mousePos.y * 40

        // Scroll-based field distortion
        const scrollDistortion = Math.sin(scrollProgress * Math.PI) * 0.5

        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3

          // Base movement with scroll velocity boost
          positions[i] += velocities[i] * (1 + scrollVelocity * 0.3)
          positions[i + 1] += velocities[i + 1] * (1 + scrollVelocity * 0.3)
          positions[i + 2] += velocities[i + 2]

          // Mouse repulsion effect
          const dx = positions[i] - mouseX
          const dy = positions[i + 1] - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 30) {
            const force = (30 - distance) / 30
            velocities[i] += (dx / distance) * force * 0.3
            velocities[i + 1] += (dy / distance) * force * 0.3

            // Pulse size on proximity
            sizes[idx] = this.originalSizes[idx] * (1 + force * 1.5)
          } else {
            // Decay back to original size with scroll influence
            const targetSize = this.originalSizes[idx] * (1 + scrollVelocity * 0.3)
            sizes[idx] += (targetSize - sizes[idx]) * 0.1
          }

          // Enhanced damping based on scroll
          const damping = 0.98 - scrollVelocity * 0.02
          velocities[i] *= damping
          velocities[i + 1] *= damping
          velocities[i + 2] *= damping

          // Scroll-based field distortion - particles compress on scroll
          const distortionFactor = 1 + scrollDistortion * 0.2
          if (Math.abs(positions[i]) > 70 * distortionFactor) velocities[i] *= -1
          if (Math.abs(positions[i + 1]) > 70 * distortionFactor) velocities[i + 1] *= -1
          if (Math.abs(positions[i + 2]) > 70) velocities[i + 2] *= -1

          // Wave motion + scroll trails
          const waveAmplitude = 0.02 + scrollVelocity * 0.05
          positions[i + 1] += Math.sin(this.time * 0.2 + idx * 0.01 + scrollProgress * 4) * waveAmplitude

          // Scroll-based vertical drift
          positions[i + 1] += scrollVelocity * 0.5
        }

        this.particles.geometry.attributes.position.needsUpdate = true
        this.particles.geometry.attributes.size.needsUpdate = true
      }

      // Dynamic camera based on scroll with smooth zoom
      this.camera.position.y = scrollProgress * 45
      this.camera.position.z = 30 + scrollVelocity * 5 // Zoom based on scroll speed

      // Camera rotation influenced by scroll
      this.camera.position.x = Math.sin(this.time * 0.1 + scrollProgress * 2) * 2

      // Color cycling on lights with scroll modulation
      if (this.scene.children.length > 0) {
        const lights = this.scene.children.filter(c => c instanceof THREE.Light) as THREE.Light[]

        // Dynamic light intensity based on scroll velocity
        if (lights[1] instanceof THREE.PointLight) {
          const hue = (this.time * 0.05 + scrollProgress * 1.5) % Math.PI
          lights[1].color.setHSL((Math.sin(hue) * 0.1 + 0.65) % 1, 1, 0.5)
          lights[1].intensity = 1.5 + scrollVelocity * 0.5 // Pulse on fast scroll
        }

        if (lights[2] instanceof THREE.PointLight) {
          lights[2].intensity = 0.8 + Math.sin(scrollProgress * 3) * 0.3
        }
      }

      this.renderer.render(this.scene, this.camera)
      this.animationId = requestAnimationFrame(tick)
    }

    tick()
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.dispose()
  }
}
