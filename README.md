# AUREL

Independent static hospitality concept. Open through any local HTTP server. No build step, account, backend, cookies, tracking or external runtime is required.

Native scrolling drives a circular photographic aperture and a separate spatial album of overlapping photographic prints. The prints turn into place as you move down the page. Select one to open its large image. Light controls change a simple colour overlay. Accessible room tabs support arrow keys, Home and End. The stay planner builds and downloads a local text itinerary. It does not make a reservation or collect payment.

Use `index.html` at the root of its own GitHub Pages repository. All paths are relative. `.nojekyll` is included. Images and fonts are bundled locally. See `assets/LICENSES.md`.

Reduced motion uses an open photographic composition and disables scroll choreography. The page and planner remain useful without WebGL, which this project does not require.

Photography is bundled at exact responsive pixel sizes. The wide desktop hero is cropped from the same original, which reduces its decoded texture from 2560 × 3854 to 2560 × 1600 without changing the intended desktop framing. Mobile uses the portrait source. Original sizes and derivative sizes are recorded in `assets/image-dimensions.json`. The official local WOFF2 font is 37,640 bytes. Large album images are promoted only near their scene; 2560px viewing versions load on request.

The site has no continuous RAF, canvas, full screen blur or CSS image filter. Paint work occurs on scroll/resize, stops in a hidden tab and is skipped when both visual scenes are outside the viewport. DOM diagnostics are exposed as `document.documentElement.dataset.renderFrames`, `drawCalls`, `triangles`, `renderDpr` and `renderMode`. The frame value counts actual choreography paint updates; draw calls and triangles are zero.
