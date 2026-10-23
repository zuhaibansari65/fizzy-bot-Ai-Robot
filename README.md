# Fizzy Bot AI Robot Exhibition

A responsive, interactive React + TypeScript exhibition experience with a procedural 3D robot built in Three.js / React Three Fiber.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL (usually `http://localhost:5173`). For a production build:

```bash
npm run build
npm run preview
```

A GitHub Pages workflow is included at `.github/workflows/pages.yml`. In the repository settings, open **Settings → Pages** and set the source to **GitHub Actions**. After the workflow completes, the public exhibition URL is `https://zuhaibansari65.github.io/fizzy-bot-Ai-Robot/`. For other static hosts, run `npm run build` and publish the generated `dist/` directory.

## Explore

- **W / A / S / D** or **arrow keys:** walk in that direction; hold for smooth movement.
- **Space:** stop immediately. Keyboard controls are ignored while typing in chat.
- **On-screen direction pad:** press and hold to walk on touch devices.
- Use the clearly marked camera buttons for **zoom** and **camera angle**. The camera is world-locked: it never follows or rotates with Fizzy, and mouse dragging does not orbit it.
- **Start walking**, **Stop**, **Reset position**, and **Reset camera** provide direct controls.
- Ask Fizzy questions about AI, robotics, science, and technology. The chat is a clearly labeled **pre-programmed demo** and does not call a live AI service.
