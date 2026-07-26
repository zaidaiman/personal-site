import { Scene } from './three/scene'

function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector<HTMLElement>('[data-carousel-track]')
    const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-dots] button'))
    const prevBtn = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]')
    const nextBtn = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]')
    if (!track) return

    const count = track.children.length
    let current = 0

    const go = (index: number) => {
      current = ((index % count) + count) % count
      track.style.transform = `translateX(-${current * 100}%)`
      dots.forEach((dot, i) => {
        dot.style.opacity = i === current ? '1' : '0.4'
      })
    }

    prevBtn?.addEventListener('click', e => {
      e.stopPropagation()
      go(current - 1)
    })
    nextBtn?.addEventListener('click', e => {
      e.stopPropagation()
      go(current + 1)
    })
    dots.forEach((dot, i) =>
      dot.addEventListener('click', e => {
        e.stopPropagation()
        go(i)
      }),
    )
  })
}

async function fetchAllGithubStars() {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-github-repo]')
  const repos = [...new Set(Array.from(links, el => el.dataset.githubRepo!))]

  await Promise.allSettled(
    repos.map(async repo => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!res.ok) return
        const { stargazers_count } = await res.json()
        if (typeof stargazers_count !== 'number') return

        document.querySelectorAll<HTMLAnchorElement>(`a[data-github-repo="${CSS.escape(repo)}"]`).forEach(link => {
          const badge = document.createElement('span')
          badge.className = 'flex items-center gap-1 text-gray-600 text-xs'
          badge.textContent = `\u2605 ${stargazers_count.toLocaleString()}`
          link.insertAdjacentElement('afterend', badge)
        })
      } catch {
        // keep silent
      }
    }),
  )
}

class App {
  scene: Scene
  private scrollProgress = 0
  private scrollVelocity = 0
  private lastScrollY = 0
  private observedElements: Map<Element, number> = new Map()

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas) {
      throw new Error('Canvas element not found')
    }

    this.scene = new Scene(canvas)
    this.setupEventListeners()
    this.setupIntersectionObserver()
    this.scene.animate(this.scrollProgress, this.scrollVelocity)
  }

  private setupEventListeners() {
    let scrollTimeout: ReturnType<typeof setTimeout>

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      this.scrollProgress = window.scrollY / maxScroll

      // Calculate scroll velocity
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - this.lastScrollY
      this.scrollVelocity = Math.min(Math.abs(scrollDelta) * 0.1, 3) // Clamp between 0-3
      this.lastScrollY = currentScrollY

      // Gradually decay velocity
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.scrollVelocity *= 0.98
      }, 50)
    })

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const href = target.getAttribute('href')
        if (href) {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    })

    // Add ripple effect on button clicks
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' && !target.classList.contains('ripple-active')) {
        this.createRippleEffect(e, target)
      }
    })
  }

  private createRippleEffect(e: MouseEvent, button: HTMLElement) {
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.max(rect.width, rect.height)

    const ripple = document.createElement('span')
    ripple.style.position = 'absolute'
    ripple.style.left = x - size / 2 + 'px'
    ripple.style.top = y - size / 2 + 'px'
    ripple.style.width = size + 'px'
    ripple.style.height = size + 'px'
    ripple.style.borderRadius = '50%'
    ripple.style.background = 'rgba(0, 217, 255, 0.5)'
    ripple.style.pointerEvents = 'none'
    ripple.style.animation = 'ripple 0.6s ease-out'

    button.style.position = 'relative'
    button.style.overflow = 'hidden'
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }

  private setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          const delay = this.observedElements.get(entry.target) || 0
          if (entry.target instanceof HTMLElement) {
            entry.target.style.animationDelay = delay + 'ms'
          }
        }
      })
    }, observerOptions)

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('section > *:not(h3), .p-6, h4, p')
    animatedElements.forEach((el, index) => {
      this.observedElements.set(el, index * 50)
      observer.observe(el)
    })
  }
}

// Add ripple animation keyframe
const style = document.createElement('style')
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .in-view {
    animation: fadeInUp 0.6s ease-out forwards !important;
  }

  .screenshot-pan {
    display: block;
    width: 100%;
    transition: transform 3s ease-in-out;
  }
  .screenshot-pan-container:hover .screenshot-pan {
    transform: translateY(calc(-100% + 18rem));
  }
`
document.head.appendChild(style)

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App()
    initCarousels()
    fetchAllGithubStars()
  })
} else {
  new App()
  initCarousels()
  fetchAllGithubStars()
}
