# Zaid Aiman — Personal Portfolio

A single-page portfolio built with **Three.js**, **TypeScript**, **Vite**, and **TailwindCSS**.

## Tech Stack

- **Three.js** — 3D particle background animation
- **TypeScript** — type-safe vanilla JS, no framework
- **Vite** — dev server and production build
- **TailwindCSS** — utility-first styling

## Features

- Interactive 3D particle scene
- Projects section with screenshot pan-on-hover and image carousels
- Dynamic GitHub star counts fetched from the public API
- Full work experience timeline (7 roles)
- Responsive, mobile-optimised layout
- SEO meta tags and sitemap

## Getting Started

### Prerequisites

- Node.js v16+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev        # http://localhost:3000
```

### Build

```bash
npm run build      # output → dist/
npm run preview    # preview production build locally
```

## Project Structure

```
.
├── public/
│   ├── assets/            # Project screenshots
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── styles/
│   │   └── main.css       # TailwindCSS entry
│   ├── three/
│   │   └── scene.ts       # Three.js scene
│   └── main.ts            # App entry — carousels, stars, scroll
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── Dockerfile
└── nginx.conf
```

## Sections

- **Hero** — name, tagline, CTA
- **Projects** — 6 projects with screenshots, live links, and GitHub stars
- **Work Experience** — 7 roles from 2009 to present
- **Skills** — 6 capability cards
- **Contact** — LinkedIn

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Minified build size: ~200KB (gzipped ~60KB)
- 60 FPS animations on modern devices
- GPU-accelerated rendering

## License

Personal use - feel free to customize for your own portfolio.

## Credits

Inspired by the creative and technical excellence of [Active Theory](https://activetheory.net)
