const $ = (selector) => document.querySelector(selector);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const opening = $(".opening");
const passage = $(".passage");
const aperture = $(".aperture");
const textMask = $(".hero-copy-mask");
const heroImage = $(".hero-image");
const heroCopies = [...document.querySelectorAll(".hero-copy")];
const passageTrack = $(".passage-track");
const passageCards = [...document.querySelectorAll(".passage-photo")];
const passageHeading = $(".passage-heading");
const meter = $(".passage-progress i");
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (n) => {
  const x = clamp(n);
  return x * x * (3 - 2 * x);
};
let frameRequested = 0;
let frames = 0;
let light = "noon";
function diagnostics(mode) {
  const data = document.documentElement.dataset;
  data.renderFrames = String(frames);
  data.drawCalls = "0";
  data.triangles = "0";
  data.renderDpr = "1";
  data.renderMode = mode;
}
function renderOpening() {
  frameRequested = 0;
  if (document.hidden) {
    diagnostics("hidden");
    return;
  }
  const viewport = $(".opening-stage").clientHeight;
  const mobileFlow = matchMedia("(max-width: 700px), (max-height: 500px) and (pointer: coarse)").matches;
  const heroRect = opening.getBoundingClientRect();
  const passageRect = passage.getBoundingClientRect();
  const heroOnscreen = heroRect.bottom > 0 && heroRect.top < viewport;
  const passageOnscreen = passageRect.bottom > 0 && passageRect.top < viewport;
  if (reduced.matches)
    passageCards.forEach((card) => {
      card.tabIndex = 0;
    });
  if (!heroOnscreen && !passageOnscreen) {
    if (!reduced.matches && !mobileFlow)
      passageCards.forEach((card) => {
        card.tabIndex = -1;
      });
    diagnostics("offscreen");
    return;
  }
  if (!reduced.matches && heroOnscreen) {
    const progress = clamp(
      -heroRect.top / Math.max(1, opening.offsetHeight - viewport),
    );
    const p = smooth(progress / 0.82);
    const mobile = innerWidth <= 600;
    const startX = mobile ? 49 : 27,
      startY = mobile ? 31 : 42;
    const path = `ellipse(${startX + (100 - startX) * p}% ${startY + (110 - startY) * p}% at ${63 - 13 * p}% ${55 - 5 * p}%)`;
    aperture.style.clipPath = path;
    textMask.style.clipPath = path;
    $(".wordmark").style.transform = `translate3d(0,${-progress * 130}px,0)`;
    $(".wordmark").style.opacity = 1 - clamp(progress * 2.8);
    heroImage.style.transform = `translate3d(0,${progress * 1.4}%,0) scale(${1.015 + progress * 0.035})`;
    $(".image-shade").style.opacity = String(0.5 + p * 0.5);
    const white = smooth((progress - 0.13) / 0.22);
    const color = `rgb(${Math.round(50 + 197 * white)},${Math.round(43 + 199 * white)},${Math.round(37 + 195 * white)})`;
    $(".hero-aside").style.color = color;
    $(".hero-bottom").style.color = color;
    heroCopies.forEach((copy) => {
      copy.style.transform = `translate3d(0,${-progress * 38}px,0)`;
    });
    $(".aperture-note").style.opacity = 1 - clamp(progress * 5);
  }
  if (mobileFlow) passageCards.forEach((card) => { card.tabIndex = 0; });
  if (!reduced.matches && !mobileFlow && passageOnscreen) {
    const p = clamp(
      -passageRect.top / Math.max(1, passage.offsetHeight - viewport),
    );
    const mobile = innerWidth <= 650;
    const turns = [1, smooth((p - 0.1) / 0.4), smooth((p - 0.48) / 0.4)];
    passageCards.forEach((card, index) => {
      const arrival = turns[index];
      let x = 0,
        y = 0,
        z = 0,
        angle = 0;
      if (index === 0) {
        x = -p * innerWidth * 0.17;
        y = -p * innerHeight * 0.08;
        z = -p * 80;
        angle = -5 - p * 4;
      }
      if (index === 1) {
        x = (1 - arrival) * innerWidth * 0.55;
        y = (1 - arrival) * innerHeight * 0.95 - 25;
        z = 40;
        angle = 24 - arrival * 18;
      }
      if (index === 2) {
        x = -(1 - arrival) * innerWidth * 0.8;
        y = (1 - arrival) * innerHeight * 0.75;
        z = 80;
        angle = -24 + arrival * 20;
      }
      card.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${mobile ? 3 : 6}deg) rotate(${angle}deg)`;
      const active = p < 0.34 ? 0 : p < 0.75 ? 1 : 2;
      card.tabIndex = index === active ? 0 : -1;
    });
    const fade = smooth((p - 0.03) / 0.36);
    passageHeading.style.opacity = String(1 - fade);
    passageHeading.style.transform = `translate3d(${-fade * 40}px,0,0)`;
    meter.style.transform = `scaleX(${p})`;
  }
  frames++;
  diagnostics("idle");
}
function requestRender() {
  if (!frameRequested && !document.hidden)
    frameRequested = requestAnimationFrame(renderOpening);
}
window.addEventListener("scroll", requestRender, { passive: true });
window.addEventListener("resize", () => {
  requestRender();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(frameRequested);
    frameRequested = 0;
    diagnostics("hidden");
  } else requestRender();
});
reduced.addEventListener("change", () => {
  aperture.style.clipPath = "";
  textMask.style.clipPath = "";
  heroImage.style.transform = "";
  $(".wordmark").style.transform = "";
  $(".wordmark").style.opacity = "";
  $(".image-shade").style.opacity = "";
  $(".aperture-note").style.opacity = "";
  heroCopies.forEach((copy) => {
    copy.style.transform = "";
  });
  $(".hero-aside").style.color = "";
  $(".hero-bottom").style.color = "";
  passageTrack.style.transform = "";
  passageHeading.style.opacity = "";
  passageHeading.style.transform = "";
  passageCards.forEach((card) => {
    card.style.transform = "";
    card.tabIndex = 0;
  });
  requestRender();
});
const lights = {
  morning: { color: "#daa15f", opacity: ".14" },
  noon: { color: "#ffffff", opacity: "0" },
  dusk: { color: "#223b5b", opacity: ".27" },
};
document.querySelectorAll("[data-light]").forEach((button) =>
  button.addEventListener("click", () => {
    light = button.dataset.light;
    document
      .querySelectorAll("[data-light]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    $(".light-tone").style.background = lights[light].color;
    $(".light-tone").style.opacity = lights[light].opacity;
  }),
);
function promotePassage() {
  passageCards.forEach((card) => {
    const image = card.querySelector("img");
    if (image.dataset.src) {
      image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      delete image.dataset.src;
      delete image.dataset.srcset;
    }
  });
}
if ("IntersectionObserver" in window) {
  const preload = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        promotePassage();
        preload.disconnect();
      }
    },
    { rootMargin: "700px" },
  );
  preload.observe(passage);
} else promotePassage();
document.documentElement.classList.add("js-scroll");
passageCards.forEach((card, index) => {
  card.tabIndex = reduced.matches || matchMedia("(max-width: 700px), (max-height: 500px) and (pointer: coarse)").matches ? 0 : -1;
  if (index && !reduced.matches)
    card.style.transform = "translate3d(0,120svh,0)";
});
diagnostics("idle");

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js-ready");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((item) => observer.observe(item));
}

const rooms = [
  {
    name: "the sun room",
    image: "suite",
    alt: "An airy living space with warm wood, soft seating and natural light",
    detail: "42 M² / TWO GUESTS / SLOW MORNINGS",
    title: "For the light<br><em>you wake up in.</em>",
    description:
      "A warm, open living space. Linen, timber and a quiet spot by the window. Leave the curtains open and let the morning find you.",
  },
  {
    name: "the pool house",
    image: "villa",
    alt: "A sunlit white villa opening onto its turquoise pool",
    detail: "68 M² / TWO GUESTS / POOLSIDE DAYS",
    title: "A little dip.<br><em>A little longer.</em>",
    description:
      "Room to drift between inside and out. A shaded terrace, cool stone underfoot and the pool just a few steps from a very good book.",
  },
  {
    name: "the coastal loft",
    image: "coast",
    alt: "A colourful Mediterranean coastal village overlooking a blue inlet",
    detail: "55 M² / TWO GUESTS / COASTAL OUTLOOK",
    title: "Keep the sea<br><em>in sight.</em>",
    description:
      "An imagined hideaway above the coast. Salt in the air, room for two, and a view that makes doing nothing feel like an excellent plan.",
  },
];
let activeRoom = 0;
function selectRoom(index, moveFocus = false) {
  activeRoom = index;
  const room = rooms[index];
  document.querySelectorAll("[data-room]").forEach((button, i) => {
    button.setAttribute("aria-selected", String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    if (moveFocus && i === index) button.focus();
  });
  $("#room-image").src = `assets/images/${room.image}-1280.webp`;
  $("#room-image").srcset = [640, 1280, 2560]
    .map((width) => `assets/images/${room.image}-${width}.webp ${width}w`)
    .join(", ");
  $("#room-image").alt = room.alt;
  $("#room-number").textContent = String(index + 1).padStart(2, "0");
  $("#room-detail").textContent = room.detail;
  $("#room-title").innerHTML = room.title;
  $("#room-description").textContent = room.description;
  $("#room-panel").setAttribute("aria-labelledby", `room-tab-${index}`);
  $("#stay-room").value = String(index);
  updateItinerary();
}
document.querySelectorAll("[data-room]").forEach((button) => {
  button.addEventListener("click", () =>
    selectRoom(Number(button.dataset.room)),
  );
  button.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (activeRoom + 1) % rooms.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (activeRoom + rooms.length - 1) % rooms.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = rooms.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectRoom(next, true);
    }
  });
});

const experiences = {
  coast: {
    title: "follow the coast",
    text: "a morning walk to the water. stop whenever the view asks you to.",
  },
  table: {
    title: "come to the long table",
    text: "an unhurried seasonal dinner, with a little space for good conversation.",
  },
  quiet: {
    title: "keep the morning open",
    text: "coffee, a page of your book, and absolutely nothing to be on time for.",
  },
};
let itineraryText = "";
function updateItinerary() {
  const form = new FormData($("#stay-form"));
  const room = rooms[Number(form.get("room"))];
  const nights = Number(form.get("nights"));
  const guests = Number(form.get("guests"));
  const chosen = form.getAll("experience");
  const lines = chosen
    .map(
      (value, index) =>
        `<div class="itinerary-row"><span>DAY ${Math.min(index + 1, nights)}</span><p>${experiences[value].title}<br>${experiences[value].text}</p></div>`,
    )
    .join("");
  $("#itinerary").innerHTML =
    `<h3>${room.name}</h3><p class="summary-meta">${nights} nights / ${guests === 1 ? "a little time for yourself" : "a little time for two"}<br>${nights + 1} days with nowhere else to be.</p>${lines || '<div class="itinerary-row"><span>ANY DAY</span><p>leave the day open.<br>sometimes that’s the best plan.</p></div>'}`;
  itineraryText = `AUREL\nA COASTAL STATE OF MIND\n\nYOUR LITTLE ESCAPE\n${room.name}\n${nights} nights, ${guests} ${guests === 1 ? "guest" : "guests"}\n\n${chosen.map((value, index) => `Day ${Math.min(index + 1, nights)}: ${experiences[value].title}\n${experiences[value].text}`).join("\n\n") || "Leave the days open. There is no rush."}\n\nAUREL is an independent hospitality concept.\nThis is a personal illustrative itinerary, not a reservation.\nNo booking or payment has been made.\n`;
}
$("#stay-form").addEventListener("change", updateItinerary);
$("#stay-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateItinerary();
  $("#download-plan").focus({ preventScroll: true });
});
$("#download-plan").addEventListener("click", () => {
  updateItinerary();
  const url = URL.createObjectURL(
    new Blob([itineraryText], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-aurel-escape.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
updateItinerary();
renderOpening();

const photoDialog = $(".photo-dialog");
const photoCaptions = {
  villa: "the long afternoon.",
  suite: "the open window.",
  garden: "the shade you found.",
};
document.querySelectorAll("[data-photo]").forEach((button) =>
  button.addEventListener("click", () => {
    const slug = button.dataset.photo;
    const image = $("#photo-detail");
    image.src = `assets/images/${slug}-2560.webp`;
    image.srcset = [640, 1280, 2560]
      .map((width) => `assets/images/${slug}-${width}.webp ${width}w`)
      .join(", ");
    image.sizes = "90vw";
    image.alt = button.querySelector("img").alt;
    $("#photo-caption").textContent = photoCaptions[slug];
    photoDialog.showModal();
    document.body.style.overflow = "hidden";
  }),
);
$(".photo-close").addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("close", () => {
  document.body.style.overflow = "";
});
photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
window.addEventListener(
  "load",
  () => {
    requestRender();
  },
  { once: true },
);
