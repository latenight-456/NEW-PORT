import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { openContactOverlay } from "./ContactOverlay";

/* Late Night Studio: "The build", a scroll-scrubbed process section with five builds:
   a website, a system, a logo, a flyer and a video edit. Tabs at the top pick which one the scroll builds.
   The section is tall and the stage stays pinned while you scroll through it.
   Scroll position IS the playhead, also INSIDE each step: boxes are dragged out of nothing,
   words blur into focus, copy and code type out letter by letter, and scrolling up reverses it exactly.
   A mouse pointer does the work in every build, and every build opens with the same chat
   (the red point grows into the client's message, you reply, both slide away)
   and ends the same way: everything breaks apart and only "Let's talk" is left.
   Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const EYEBROW = "The build";
const CTA = "Let's talk";
const NOTE = "go on, press it";
const LAST = { title: "Your turn.", text: "Everything above ends in this one button. Press it and we start yours." };
const WEB = {
  tab: "Website",
  intro: "From a first chat to a live site.",
  ask: "Hi! I need a website for my business.",
  reply: "Let's build it.",
  brand: "yourbrand",
  url: "yourbusiness.com",
  /* the finished site. Upload a screenshot to your project and put its path here; in "Live." it pulls down over the demo */
  shot: "/images/website-benansah.png",
  headline: ["Your", "business,", "online."], // one entry per word; they blur in one by one
  body: "A website that works as hard as you do, on every screen.",
  second: "See more",
  nav: ["Work", "Services", "Contact"],
  steps: [
    { title: "A conversation.", text: "Every project starts with one point: what you do, and who needs to find you." },
    { title: "A grid.", text: "Lines and columns first, so everything lines up later." },
    { title: "A layout.", text: "Boxes before beauty: where the menu, headline and buttons belong." },
    { title: "A typeface.", text: "Words get a voice. Size and line breaks are tuned by eye." },
    { title: "A colour.", text: "A few colours, used with discipline. Yours, not a template's." },
    { title: "A line of code.", text: "Written by hand, so it loads fast on any phone." },
    { title: "Live.", text: "Tested, launched and handed over with no loose ends." },
  ],
};
const LOGO = {
  tab: "Logo",
  intro: "From a first chat to a finished logo.",
  ask: "Hi! I need a logo for my business.",
  reply: "Let's draw it.",
  name: "latenight", // the wordmark under the mark
  email: "hello@latenight.studio",
  colour: "#ff3100", // the mark's own colour
  steps: [
    { title: "A conversation.", text: "Every logo starts with a story: who you are, and who you're for." },
    { title: "A sketch.", text: "Rough ideas first. Most get thrown away; one survives." },
    { title: "Construction.", text: "The idea is redrawn on a grid as one clean line, with round ends." },
    { title: "A mark.", text: "The line gets its weight, point by point, and becomes solid." },
    { title: "A wordmark.", text: "Your name gets a typeface, with spacing tuned letter by letter." },
    { title: "A colour.", text: "One strong colour. Enough to be remembered, never shouted." },
    { title: "Variations.", text: "On dark, on colour, tiny as a favicon, printed on a card. It holds up everywhere." },
  ],
};
const FLYER = {
  tab: "Flyer",
  intro: "From a blank page to a printed flyer.",
  ask: "Hi! We need a flyer for our summer beach party.",
  reply: "Let's make it hot.",
  /* the finished flyer. Upload it to your project (e.g. public/images/) and put its path here.
     The build draws its layout and type, then this photo paints in over it. */
  image: "/images/flyer-tropic.jpg",
  // the type on the flyer, so the build writes the same words before the photo goes in
  h1: "TROPIC",
  h2: "LIKE IT'S",
  h3: "HOT",
  side: [["SUNNY SKIES,", false], ["BEACH UMBRELLAS,", false], ["AND ENDLESS", true], ["COASTAL VIEWS.", true]] as [string, boolean][],
  summer: "SUMMER.2024",
  tags: "SUN•SAND•SURF•BEACH•VIBES•TROPICAL•SUNSHINE•PARADISE",
  mini: "The Bridge",
  palette: [["Sky", "#1f8fd1"], ["Sun", "#ffd21f"], ["White", "#ffffff"]] as [string, string][],
  steps: [
    { title: "A conversation.", text: "Every flyer starts with one question: how should people feel when they see it?" },
    { title: "A format.", text: "A blank page with bleed and safe margins, so the printer never trims anything important." },
    { title: "A layout.", text: "Headline, photo, date, details. In that order of importance." },
    { title: "A typeface.", text: "Heavy italic capitals that shout summer from across the street." },
    { title: "A colour.", text: "Sky blue and sun yellow, straight from the mood of the day." },
    { title: "The photo.", text: "The shoot goes in, everything locks to it, and it's exported print-ready." },
    { title: "Out in the world.", text: "Printed, pinned up and doing its job." },
  ],
};
const SYSTEM = {
  tab: "System",
  intro: "From a notebook to a working system.",
  ask: "Hi! Our bookings still live in a notebook.",
  reply: "Let's build you a system.",
  /* the finished system. In "Live." this screenshot pulls down over the demo dashboard */
  shot: "/images/system-merchsales.png",
  app: "Bookings",
  nav: ["Dashboard", "Bookings", "Customers", "Staff", "Settings"],
  greeting: "Good morning, Esi",
  action: "+ New booking",
  stats: [["Today", "24"], ["This week", "138"], ["No-shows", "2"]],
  rows: [
    ["09:00", "Ama Mensah", "Confirmed"],
    ["09:30", "Kojo Boateng", "Confirmed"],
    ["10:00", "Efua Owusu", "Pending"],
    ["11:15", "Yaw Darko", "Confirmed"],
  ],
  newRow: ["10:30", "Kofi Asante", "New"],
  flow: ["New booking", "1 day before", "Send SMS reminder"],
  toast: "Reminder sent to Ama · see you at 9:00",
  steps: [
    { title: "A conversation.", text: "Every system starts with how you work today: who books, who serves, what gets missed." },
    { title: "A map.", text: "Customers, bookings, staff. What connects to what, before any screen exists." },
    { title: "Screens.", text: "The dashboard is laid out around the questions you ask every morning." },
    { title: "Real data.", text: "Your real bookings, counted and charted as they come in." },
    { title: "A colour.", text: "Colour only where it matters: what needs your attention today." },
    { title: "Automations.", text: "Reminders send themselves and new bookings land on their own. No more chasing." },
    { title: "Live.", text: "Handed over and in use every day, on the desk and on the go." },
  ],
};
const VIDEO = {
  tab: "Video",
  intro: "From raw clips to a finished cut.",
  ask: "Hi! We filmed our launch night on a phone.",
  reply: "Send the clips. Let's cut it.",
  /* optional: your finished video (an .mp4 in your project, e.g. "/videos/launch.mp4"). It plays, muted, in the three
     exports at the end. Empty = the drawn night scene is used everywhere */
  clip: "",
  title: "LAUNCH NIGHT",
  clips: [["C001", "0:12"], ["C002", "0:08"], ["C003", "0:21"], ["C004", "0:05"], ["C005", "0:15"], ["C006", "0:09"]],
  palette: [["Shadow", "#1d3b57"], ["Skin", "#e3a37c"], ["Glow", "#ffc56b"]] as [string, string][],
  formats: [["16:9", "YouTube"], ["9:16", "Reels · TikTok"], ["1:1", "Feed"]],
  steps: [
    { title: "A conversation.", text: "Every edit starts with one question: what should people feel when it ends?" },
    { title: "The footage.", text: "Every clip watched and logged. The moments worth keeping get starred." },
    { title: "A timeline.", text: "Clips dropped in story order: the open, the build, the payoff." },
    { title: "The cut.", text: "Trimmed to the beat. Every second has to earn its place." },
    { title: "A grade.", text: "Flat phone footage, coloured into one mood from shot to shot." },
    { title: "Sound and titles.", text: "Music, levels and titles, timed to land on the cuts." },
    { title: "Delivered.", text: "Exported for every screen: wide, tall and square." },
  ],
};
const LENGTH = 7; // scroll length in screen heights (higher = slower)
/* =============================================================== */

const W = 880; // stage design size (scaled to fit the screen)
const H = 540;
const N = 8; // steps per build (7 above + "Your turn.")

type Key = "web" | "logo" | "flyer" | "system" | "video";
export type BuildKey = Key;
type Pt = [number, number, number, number]; // [playhead (in steps), x, y, pressed]

/* Text that types itself between scroll positions a and b (in steps, e.g. 3.5 = halfway through step 4). */
function T({ text, a, b, className }: { text: string; a: number; b: number; className?: string }) {
  return (
    <span className={"ty " + (className || "")} data-ty={text} data-a={a} data-b={b}>
      <span className="ty__on">{text}</span>
      <span className="ty__off" />
    </span>
  );
}

const sc = (a: number, d: number) => ({ ["--a" as any]: a, ["--d" as any]: d }) as React.CSSProperties;
/* where a piece flies to when the finished work breaks apart (px, design space) */
const dv = (x: number, y: number) => ({ ["--vx" as any]: x, ["--vy" as any]: y }) as React.CSSProperties;

/* video timeline: [x, width, which bin thumbnail] for the five clips on V1 (the third gets cut at x 420) */
const VD_CLIPS: [number, number, number][] = [[90, 130, 0], [220, 100, 2], [320, 160, 1], [480, 120, 5], [600, 110, 3]];
const VD_THUMB = (i: number) => [56 + (i % 2) * 114 + 55, 76 + Math.floor(i / 2) * 90 + 31];

/* ---------------- the pointer's routes ----------------
   Between two pressed points it moves in a straight line at constant speed (a drag, matched to what it draws);
   otherwise it eases. Coordinates are in the 880x540 stage. */
const START: Pt[] = [[0.82, 940, 300, 0]];
const END: Pt[] = [[7.3, 700, 420, 0], [7.55, 560, 300, 0], [7.7, 620, 330, 0]];
const ROUTES: Record<Key, Pt[]> = {
  web: [
    ...START, [0.98, 40, 44, 0],
    [1.0, 40, 44, 1], [1.48, 822, 44, 1], [1.52, 822, 44, 0], // sweeps the grid columns in
    [1.76, 0, 0, 0], [1.78, 0, 0, 1], [1.98, 880, 540, 1], [2.0, 880, 540, 0], // drags out the browser frame
    [2.03, 40, 60, 0], [2.04, 40, 60, 1], [2.12, 170, 94, 1], [2.13, 170, 94, 0], // logo
    [2.15, 490, 64, 0], [2.16, 490, 64, 1], [2.265, 734, 92, 1], [2.275, 734, 92, 0], // menu (in the wrong place)
    [2.29, 40, 130, 0], [2.3, 40, 130, 1], [2.42, 440, 258, 1], [2.43, 440, 258, 0], // headline
    [2.44, 40, 290, 0], [2.45, 40, 290, 1], [2.53, 360, 344, 1], [2.54, 360, 344, 0], // body
    [2.55, 40, 370, 0], [2.56, 40, 370, 1], [2.62, 210, 422, 1], [2.63, 210, 422, 0], // button
    [2.635, 226, 370, 0], [2.64, 226, 370, 1], [2.7, 376, 422, 1], [2.71, 376, 422, 0], // second button
    [2.72, 480, 120, 0], [2.73, 480, 120, 1], [2.85, 840, 420, 1], [2.86, 840, 420, 0], // image
    [2.9, 540, 78, 0], [2.91, 540, 78, 1], [2.99, 650, 78, 1], [3.0, 650, 78, 0], // drags the menu into place
    [3.05, 70, 170, 0], [3.06, 70, 170, 1], [3.1, 70, 170, 0], // clicks into the headline
    [3.43, 70, 310, 0], [3.44, 70, 310, 1], [3.48, 70, 310, 0], // clicks into the body copy
    [3.9, 380, 330, 0],
    [4.08, 297, -45, 0], [4.1, 297, -45, 1], [4.34, 184, 396, 1], [4.36, 184, 396, 0], // carries red to the button
    [4.48, 660, 120, 0], [4.5, 660, 120, 1], [4.95, 660, 420, 1], [4.97, 660, 420, 0], // paints the artwork down
    [5.06, 600, 200, 0], [5.08, 600, 200, 1], [5.11, 600, 200, 0], [5.7, 600, 240, 0], [5.9, 860, 330, 0],
    [6.15, 440, 17, 0], [6.17, 440, 17, 1], [6.21, 440, 17, 0], // clicks the address bar: publish
    [6.24, 600, 40, 0], [6.25, 600, 40, 1], [6.6, 600, 530, 1], [6.62, 600, 530, 0], // pulls the real site down
    [6.6, 700, 470, 0], ...END,
  ],
  logo: [
    ...START, [1.0, 120, 200, 0],
    // three rough sketches; the middle one is your mark
    [1.05, 120, 200, 1], [1.1, 200, 200, 1], [1.16, 195, 270, 1], [1.22, 160, 310, 1], [1.27, 125, 270, 1], [1.3, 120, 200, 1], [1.31, 120, 200, 0],
    [1.33, 425, 186, 0], [1.34, 425, 186, 1], [1.4, 424, 309, 1], [1.41, 424, 309, 0], [1.42, 451, 217, 0], [1.43, 451, 217, 1], [1.46, 450, 274, 1], [1.47, 450, 274, 0],
    [1.48, 386, 278, 0], [1.49, 386, 278, 1], [1.55, 494, 266, 1], [1.56, 494, 266, 0], [1.565, 386, 278, 0], [1.57, 386, 278, 1], [1.6, 425, 309, 1], [1.61, 425, 309, 0],
    [1.62, 680, 200, 0], [1.63, 680, 200, 1], [1.67, 720, 250, 1], [1.71, 760, 200, 1], [1.72, 760, 200, 0],
    [1.73, 720, 250, 0], [1.74, 720, 250, 1], [1.77, 720, 305, 1], [1.78, 720, 305, 0],
    [1.79, 670, 312, 0], [1.8, 670, 312, 1], [1.83, 770, 312, 1], [1.84, 770, 312, 0],
    // circles the one that survives
    [1.85, 565, 250, 0], [1.86, 565, 250, 1], [1.89, 440, 368, 1], [1.92, 315, 250, 1], [1.95, 440, 132, 1], [1.98, 565, 250, 1], [1.99, 565, 250, 0],
    // drags out the artboard, then draws the mark as one clean centre line
    [2.03, 220, 20, 0], [2.04, 220, 20, 1], [2.14, 660, 460, 1], [2.15, 660, 460, 0],
    [2.24, 404, 50, 0], [2.25, 404, 50, 1], [2.37, 404, 339, 1], [2.38, 404, 339, 0],
    [2.39, 464, 124, 0], [2.4, 464, 124, 1], [2.48, 464, 257, 1], [2.49, 464, 257, 0],
    [2.51, 309, 266, 0], [2.52, 309, 266, 1], [2.59, 440, 240, 1], [2.66, 567, 239, 1], [2.67, 567, 239, 0],
    [2.68, 309, 266, 0], [2.69, 309, 266, 1], [2.73, 375, 290, 1], [2.77, 404, 339, 1], [2.78, 404, 339, 0],
    [2.79, 464, 124, 0], [2.8, 464, 124, 1], [2.85, 500, 200, 1], [2.9, 567, 239, 1], [2.91, 567, 239, 0],
    // places the anchor points while the outline draws
    [3.0, 404, 50, 0], [3.02, 404, 50, 1], [3.05, 404, 50, 0], [3.08, 404, 339, 0], [3.1, 404, 339, 1], [3.13, 404, 339, 0],
    [3.16, 309, 266, 0], [3.18, 309, 266, 1], [3.21, 309, 266, 0], [3.24, 567, 239, 0], [3.26, 567, 239, 1], [3.29, 567, 239, 0],
    [3.6, 640, 300, 0],
    [4.0, 300, 395, 0], [4.02, 300, 395, 1], [4.05, 300, 395, 0], [4.5, 640, 440, 0], // clicks into the wordmark
    [5.08, 297, -45, 0], [5.1, 297, -45, 1], [5.34, 404, 200, 1], [5.36, 404, 200, 0], [5.7, 640, 300, 0], // colour onto the mark
    // checks every variation, then exports
    [6.3, 565, 135, 0], [6.32, 565, 135, 1], [6.35, 565, 135, 0], [6.4, 765, 135, 0], [6.42, 765, 135, 1], [6.45, 765, 135, 0],
    [6.5, 530, 310, 0], [6.52, 530, 310, 1], [6.55, 530, 310, 0], [6.6, 735, 310, 0], [6.62, 735, 310, 1], [6.65, 735, 310, 0],
    [6.76, 650, 432, 0], [6.78, 650, 432, 1], [6.82, 650, 432, 0], ...END,
  ],
  flyer: [
    ...START, [0.98, 238, 0, 0],
    [1.0, 238, 0, 1], [1.25, 641, 540, 1], [1.26, 641, 540, 0], // drags out the blank page
    [1.45, 672, 8, 0], [1.47, 672, 8, 1], [1.5, 672, 8, 0], [1.9, 720, 300, 0],
    [2.03, 328, 175, 0], [2.04, 328, 175, 1], [2.14, 553, 540, 1], [2.15, 553, 540, 0], // the photo
    [2.155, 281, 45, 0], [2.16, 281, 45, 1], [2.24, 565, 116, 1], [2.25, 565, 116, 0], // TROPIC
    [2.255, 267, 130, 0], [2.26, 267, 130, 1], [2.31, 395, 157, 1], [2.315, 395, 157, 0], // LIKE IT'S
    [2.325, 335, 121, 0], [2.33, 335, 121, 1], [2.41, 569, 209, 1], [2.415, 569, 209, 0], // HOT (in the wrong place)
    [2.425, 535, 268, 0], [2.43, 535, 268, 1], [2.47, 635, 324, 1], [2.475, 635, 324, 0], // side copy
    [2.485, 422, 376, 0], [2.49, 422, 376, 1], [2.51, 462, 398, 1], [2.515, 462, 398, 0], // small logo
    [2.525, 309, 412, 0], [2.53, 309, 412, 1], [2.6, 573, 450, 1], [2.605, 573, 450, 0], // SUMMER.2024
    [2.615, 307, 457, 0], [2.62, 307, 457, 1], [2.67, 573, 473, 1], [2.675, 573, 473, 0], // the tag line
    [2.78, 452, 165, 0], [2.8, 452, 165, 1], [2.9, 512, 165, 1], [2.91, 512, 165, 0], // drags HOT into place
    [3.02, 300, 80, 0], [3.04, 300, 80, 1], [3.07, 300, 80, 0], [3.38, 320, 465, 0], [3.4, 320, 465, 1], [3.43, 320, 465, 0],
    [3.95, 700, 300, 0],
    [4.08, 297, -45, 0], [4.1, 297, -45, 1], [4.34, 420, 80, 1], [4.36, 420, 80, 0], // sun yellow onto the headline
    [4.48, 440, 8, 0], [4.5, 440, 8, 1], [4.95, 440, 530, 1], [4.97, 440, 530, 0], // paints the sky down
    [5.03, 520, 10, 0], [5.05, 520, 10, 1], [5.5, 520, 530, 1], [5.52, 520, 530, 0], // pulls the photo down over it
    [5.62, 760, 498, 0], [5.65, 760, 498, 1], [5.68, 760, 498, 0], [5.95, 720, 300, 0], // export
    [6.45, 440, 8, 0], [6.53, 440, 8, 1], [6.6, 440, 8, 0], [6.9, 700, 420, 0], // pins it up
    ...END,
  ],
  system: [
    ...START, [0.98, 110, 150, 0],
    // the map: three tables, then the lines between them
    [1.0, 110, 150, 1], [1.12, 300, 280, 1], [1.13, 300, 280, 0],
    [1.14, 345, 250, 0], [1.15, 345, 250, 1], [1.27, 535, 380, 1], [1.28, 535, 380, 0],
    [1.29, 580, 150, 0], [1.3, 580, 150, 1], [1.42, 770, 280, 1], [1.43, 770, 280, 0],
    [1.5, 140, 172, 0], [1.52, 140, 172, 1], [1.55, 140, 172, 0],
    [1.74, 300, 215, 0], [1.75, 300, 215, 1], [1.85, 345, 315, 1], [1.86, 345, 315, 0],
    [1.865, 580, 215, 0], [1.87, 580, 215, 1], [1.97, 535, 315, 1], [1.98, 535, 315, 0],
    // the screens
    [2.19, 80, 40, 0], [2.2, 80, 40, 1], [2.3, 800, 500, 1], [2.305, 800, 500, 0],
    [2.315, 80, 40, 0], [2.32, 80, 40, 1], [2.37, 230, 500, 1], [2.375, 230, 500, 0],
    [2.38, 230, 40, 0], [2.385, 230, 40, 1], [2.41, 800, 90, 1], [2.415, 800, 90, 0],
    [2.42, 660, 50, 0], [2.425, 660, 50, 1], [2.45, 786, 80, 1], [2.455, 786, 80, 0],
    [2.465, 250, 110, 0], [2.47, 250, 110, 1], [2.505, 420, 190, 1], [2.51, 420, 190, 0],
    [2.51, 430, 110, 0], [2.515, 430, 110, 1], [2.55, 600, 190, 1], [2.555, 600, 190, 0],
    [2.555, 610, 110, 0], [2.56, 610, 110, 1], [2.595, 780, 190, 1], [2.6, 780, 190, 0],
    [2.605, 250, 210, 0], [2.61, 250, 210, 1], [2.67, 510, 480, 1], [2.675, 510, 480, 0],
    [2.68, 530, 210, 0], [2.685, 530, 210, 1], [2.745, 780, 480, 1], [2.75, 780, 480, 0],
    // real data
    [3.02, 120, 112, 0], [3.04, 120, 112, 1], [3.07, 120, 112, 0], [3.5, 380, 330, 0], [3.9, 650, 300, 0],
    // colour: red onto today's bar, then the button and the menu
    [4.08, 297, -45, 0], [4.1, 297, -45, 1], [4.34, 434, 400, 1], [4.36, 434, 400, 0],
    [4.48, 723, 65, 0], [4.5, 723, 65, 1], [4.53, 723, 65, 0], [4.6, 140, 112, 0], [4.62, 140, 112, 1], [4.65, 140, 112, 0],
    // automations
    [5.03, 250, 210, 0], [5.05, 250, 210, 1], [5.13, 510, 480, 1], [5.14, 510, 480, 0],
    [5.5, 470, 400, 0], [5.62, 660, 470, 0], [5.95, 700, 300, 0],
    // live: taps the phone
    [6.03, 440, 44, 0], [6.05, 440, 44, 1], [6.4, 440, 500, 1], [6.42, 440, 500, 0], // pulls the real system down
    [6.55, 765, 260, 0], [6.6, 765, 260, 1], [6.64, 765, 260, 0], [6.9, 700, 420, 0],
    ...END,
  ],
  video: [
    ...START, [0.98, 40, 40, 0],
    [1.0, 40, 40, 1], [1.15, 300, 340, 1], [1.16, 300, 340, 0], // drags out the footage bin
    [1.5, 111, 197, 0], [1.52, 111, 197, 1], [1.55, 111, 197, 0], [1.62, 225, 287, 0], [1.64, 225, 287, 1], [1.67, 225, 287, 0], // stars the good takes
    [1.9, 600, 200, 0],
    [2.03, 320, 40, 0], [2.04, 320, 40, 1], [2.16, 840, 332, 1], [2.17, 840, 332, 0], // the monitor
    [2.2, 40, 352, 0], [2.21, 40, 352, 1], [2.33, 840, 500, 1], [2.34, 840, 500, 0], // the timeline
    // drags five clips onto the timeline, in story order
    ...VD_CLIPS.flatMap(([x, w, t], i): Pt[] => {
      const s0 = 2.4 + i * 0.12;
      const [tx, ty] = VD_THUMB(t);
      return [[s0, tx, ty, 0], [s0 + 0.01, tx, ty, 1], [s0 + 0.1, x + w / 2, 414, 1], [s0 + 0.11, x + w / 2, 414, 0]];
    }),
    [3.2, 420, 414, 0], [3.22, 420, 414, 1], [3.25, 420, 414, 0], // razor: cuts the long clip
    [3.3, 450, 414, 0], [3.32, 450, 414, 1], [3.35, 450, 414, 0], // deletes the tail, the rest ripples left
    [3.7, 600, 250, 0], [3.95, 700, 300, 0],
    [4.08, 297, -45, 0], [4.1, 297, -45, 1], [4.34, 580, 186, 1], [4.36, 580, 186, 0], // carries the grade onto the shot
    [4.38, 322, 186, 0], [4.4, 322, 186, 1], [4.8, 838, 186, 1], [4.82, 838, 186, 0], // wipes before -> after
    [4.95, 700, 300, 0],
    [5.33, 220, 379, 0], [5.35, 220, 379, 1], [5.47, 420, 379, 1], [5.48, 420, 379, 0], // drags out the title
    [5.9, 700, 300, 0],
    [6.03, 790, 367, 0], [6.05, 790, 367, 1], [6.08, 790, 367, 0], // export
    [6.6, 250, 267, 0], [6.62, 250, 267, 1], [6.65, 250, 267, 0], // plays the wide one
    [6.9, 700, 420, 0],
    ...END,
  ],
};
/* while the colour rides on the pointer, which step shows the swatches, and which swatches */
const CARRY: Record<Key, [number, number]> = { web: [4.1, 4.34], logo: [5.1, 5.34], flyer: [4.1, 4.34], system: [4.1, 4.34], video: [4.1, 4.34] };
const COLOUR_STEP: Record<Key, number> = { web: 4, logo: 5, flyer: 4, system: 4, video: 4 };
const BASE_SWATCHES: [string, string][] = [["Ink", "#28272a"], ["Paper", "#cdc9c3"], ["Red", "#ed1d04"]];
const SWATCHES: Record<Key, [string, string][]> = {
  web: BASE_SWATCHES,
  logo: [["Ink", "#28272a"], ["Paper", "#cdc9c3"], ["Flame", LOGO.colour]],
  flyer: FLYER.palette,
  system: BASE_SWATCHES,
  video: VIDEO.palette,
};
const CARRY_COLOUR: Record<Key, string> = { web: "#ed1d04", logo: LOGO.colour, flyer: FLYER.palette[1][1], system: "#ed1d04", video: VIDEO.palette[1][1] };

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function routeAt(R: Pt[], q: number) {
  if (q <= R[0][0]) return { x: R[0][1], y: R[0][2], down: false };
  for (let i = 1; i < R.length; i++) {
    const [q1, x1, y1, p1] = R[i];
    if (q > q1) continue;
    const [q0, x0, y0, p0] = R[i - 1];
    const drag = p0 === 1 && p1 === 1;
    const t = q1 === q0 ? 1 : (q - q0) / (q1 - q0);
    const k = drag ? t : ease(t);
    return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, down: drag };
  }
  const L = R[R.length - 1];
  return { x: L[1], y: L[2], down: false };
}

/* ---------------- website ---------------- */
const CODE_A = 5.08; // the code window types out as one stream between these playheads
const CODE_B = 5.66;
const CODE: [string, string][][] = [
  [["u", "<header"], ["", " "], ["i", "class"], ["", "="], ["q", '"hero"'], ["u", ">"]],
  [["", "  "], ["u", "<h1>"], ["", "Your business, online."], ["u", "</h1>"]],
  [["", "  "], ["u", "<a"], ["", " "], ["i", "href"], ["", "="], ["q", '"#contact"'], ["", " "], ["i", "class"], ["", "="], ["q", '"btn"'], ["u", ">"]],
  [["", "    Let's talk"]],
  [["", "  "], ["u", "</a>"]],
  [["u", "</header>"]],
];
const CODE_LEN = CODE.flat().reduce((n, [, t]) => n + t.length, 0);

/* the real finished work: paints down over the demo once it has loaded (if it can't load, the demo ending stays) */
const SHOT_IN: Partial<Record<Key, number>> = { web: 6.6, system: 6.4 }; // when the screenshot has fully covered the demo
const ShotCtx = React.createContext<(ok: boolean) => void>(() => {});
function Shot({ src, className, a, d }: { src: string; className: string; a: number; d: number }) {
  const ok = React.useContext(ShotCtx);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const im = ref.current;
    if (im && im.complete && im.naturalWidth > 0) ok(true);
  }, []);
  if (!src) return null;
  return (
    <span className={"shot " + className} style={sc(a, d)}>
      <img ref={ref} src={src} alt="" onLoad={() => ok(true)} onError={() => ok(false)} />
    </span>
  );
}

function WebScene() {
  let c0 = 0;
  const span = CODE_B - CODE_A;
  return (
    <>
      {/* grid: columns grow down one after another */}
      <div className="cols">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={sc(1.0 + i * 0.04, 0.3)} />
        ))}
      </div>
      {/* the browser frame */}
      <div className="frame" style={sc(1.78, 0.2)}>
        <div className="bar">
          <b />
          <b />
          <b />
          <span className="url">
            <i /> {WEB.url}
          </span>
        </div>
      </div>
      {/* boxes are dragged out corner to corner; text arrives inside them */}
      <div className="box logo" style={{ left: 40, top: 60, width: 130, height: 34, ...sc(2.04, 0.08), ...dv(-70, -60) }}>
        <span className="t">
          <T text={WEB.brand} a={3.35} b={3.5} />
          <span className="red">.</span>
        </span>
      </div>
      {WEB.nav.map((n, i) => (
        <div key={n} className="box pill" style={{ left: 600 + i * 84, top: 64, width: 76, height: 28, ...sc(2.16 + i * 0.035, 0.035), ...dv(40 + i * 40, -90 + i * 20) }}>
          <span className="t">
            <T text={n} a={3.4 + i * 0.05} b={3.5 + i * 0.05} />
          </span>
        </div>
      ))}
      <div className="box img" style={{ left: 480, top: 120, width: 360, height: 300, ...sc(2.73, 0.12), ...dv(120, 40) }}>
        <svg className="x" viewBox="0 0 360 300" preserveAspectRatio="none" style={sc(2.85, 0.1)}>
          <path d="M0 0L360 300M360 0L0 300" pathLength={1} />
        </svg>
        <span className="art" style={sc(4.5, 0.45)}>
          <span className="moon" />
          <span className="star" style={{ left: "22%", top: "24%" }} />
          <span className="star" style={{ left: "74%", top: "70%" }} />
          <span className="star" style={{ left: "64%", top: "18%" }} />
        </span>
      </div>
      <div className="box head" style={{ left: 40, top: 130, width: 400, height: 128, ...sc(2.3, 0.12), ...dv(-110, -30) }}>
        <span className="bars" style={sc(3.05, 0.35)}>
          <s style={{ width: "88%" }} />
          <s style={{ width: "54%" }} />
        </span>
        <span className="t">
          {WEB.headline.map((w, i) => (
            <React.Fragment key={w + i}>
              <span className="hw" style={sc(3.0 + i * 0.12, 0.22)}>
                {w}
              </span>
              {i === WEB.headline.length - 2 ? <br /> : " "}
            </React.Fragment>
          ))}
        </span>
      </div>
      <span className="label font" style={{ left: 40, top: 112 }}>
        Display · 50/54
      </span>
      <span className="label wbar" style={{ left: 40, top: 266, width: 400 }}>
        <em>400</em>
      </span>
      <div className="box body" style={{ left: 40, top: 290, width: 320, height: 54, ...sc(2.45, 0.08), ...dv(-90, 60) }}>
        <span className="bars" style={sc(3.45, 0.2)}>
          <s style={{ width: "92%" }} />
          <s style={{ width: "60%" }} />
        </span>
        <span className="t">
          <T text={WEB.body} a={3.5} b={3.95} />
        </span>
      </div>
      <div className="box btn2" style={{ left: 226, top: 370, width: 150, height: 52, ...sc(2.64, 0.06), ...dv(60, 80) }}>
        <span className="t">
          <T text={WEB.second} a={3.62} b={3.74} />
        </span>
      </div>
      <span className="label hbar" style={{ left: 22, top: 370, height: 52 }}>
        <em>52</em>
      </span>
      <span className="label vbar" style={{ left: 850, top: 120, height: 300 }}>
        <em>300</em>
      </span>
      {/* code types itself, then turns see-through and fades */}
      <div className="code">
        <p className="code__bar">
          <b />
          <b />
          <b /> index.html
        </p>
        {CODE.map((line, li) => (
          <p key={li} className="code__ln">
            <span>{li + 1}</span>
            <code>
              {line.map(([k, txt], si) => {
                const a = CODE_A + (c0 / CODE_LEN) * span;
                c0 += txt.length;
                const b = CODE_A + (c0 / CODE_LEN) * span;
                return <T key={si} text={txt} a={a} b={b} className={k} />;
              })}
            </code>
          </p>
        ))}
      </div>
      {/* 7. the real site pulls down over the demo */}
      <Shot src={WEB.shot} className="web-shot" a={6.25} d={0.35} />
    </>
  );
}

/* ---------------- logo ---------------- */
// your mark (from logo.svg), in its own coordinates, and the box it is drawn in on the stage
export const MARK_D =
  "M1692.789,524.267C1682.78,525.3 1672.602,526.691 1662.421,528.425L1662.421,610.786C1662.421,617.103 1657.578,622.365 1651.282,622.888C1644.986,623.41 1639.342,619.018 1638.301,612.787C1632.175,576.117 1606.557,558.415 1564.941,555.945C1559.349,555.613 1554.709,551.498 1553.712,545.985C1552.714,540.472 1555.618,534.993 1560.739,532.722C1583.88,522.462 1610.638,514.364 1638.135,508.597L1638.135,346.198C1638.135,339.496 1643.576,334.054 1650.278,334.054C1656.98,334.054 1662.421,339.496 1662.421,346.198L1662.421,504.133C1672.606,502.52 1682.776,501.228 1692.789,500.268L1692.789,416.364C1692.733,415.991 1692.678,415.618 1692.626,415.244C1691.694,408.607 1696.325,402.462 1702.962,401.53C1706.663,401.01 1710.211,402.22 1712.787,404.543C1715.41,406.771 1717.076,410.093 1717.076,413.801L1717.076,414.433C1723.853,454.147 1757.937,490.88 1802.924,507.282C1809.199,509.57 1812.448,516.494 1810.198,522.782C1807.948,529.07 1801.043,532.36 1794.741,530.148C1775.702,523.462 1747.971,521.051 1717.076,522.449L1717.076,535.649C1717.076,542.351 1711.634,547.792 1704.932,547.792C1698.23,547.792 1692.789,542.351 1692.789,535.649L1692.789,524.267ZM1717.076,472.847L1717.076,498.574C1725.124,498.231 1732.982,498.123 1740.565,498.255C1731.683,490.505 1723.791,481.958 1717.076,472.847ZM1638.135,533.224C1628.447,535.409 1618.879,537.901 1609.579,540.687C1617.55,543.91 1624.659,547.956 1630.897,552.806C1633.448,554.789 1635.86,556.906 1638.135,559.163L1638.135,533.224Z";
export const MARK_VB = "1548 328 270 302";
// the mark is one line 24.3 units wide with round ends; these are its centre lines, drawn first
export const SKELETON: [string, number, number][] = [
  ["M1650.3 346.2V610.8", 2.25, 0.12],
  ["M1704.9 413.8V535.6", 2.4, 0.08],
  ["M1563 544C1615 524 1700 506 1760 510C1778 511 1790 515 1799 519", 2.52, 0.14],
  ["M1563 544C1612 547 1640 568 1650.3 610.8", 2.69, 0.08],
  ["M1704.9 413.8C1712 455 1750 495 1799 519", 2.8, 0.1],
];
// line ends and anchor points, in stage coordinates
const ENDS = [[404, 50], [404, 339], [464, 124], [464, 257], [309, 266], [567, 239]];
const ANCHORS = [[404, 50], [404, 339], [309, 266], [567, 239]];
function Mark({ fill, className, style }: { fill: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox={MARK_VB} aria-hidden="true">
      <path d={MARK_D} style={{ fill }} />
    </svg>
  );
}
const SKETCHES = [
  "M60 50Q100 30 140 50L135 120Q100 165 65 120ZM80 80L120 80",
  "M85 36L84 159M111 67L110 124M46 128Q100 110 154 116M46 128Q80 130 85 159M111 67Q116 98 154 116",
  "M60 50L100 100L140 50M100 100L100 155M50 162Q100 182 150 162",
];

function LogoScene() {
  const ink = "var(--site-ink)";
  const c = "var(--logo-c)";
  return (
    <>
      <div className="lg-art">
        {/* 2. sketches, one gets circled */}
        {SKETCHES.map((d, i) => (
          <div key={i} className="box lg-thumb" style={{ left: 60 + i * 280, top: 150, width: 200, height: 200, ...sc(1.01 + i * 0.3, 0.03) }}>
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <path d={d} pathLength={1} style={sc(1.05 + i * 0.29, i === 2 ? 0.22 : 0.25)} />
            </svg>
          </div>
        ))}
        <svg className="lg-ov" viewBox="0 0 880 540" aria-hidden="true">
          <ellipse className="lg-pick" cx="440" cy="250" rx="125" ry="118" pathLength={1} style={sc(1.86, 0.12)} />
        </svg>
        {/* 3. artboard, grid, the centre lines and their round ends */}
        <div className="box lg-board" style={{ left: 220, top: 20, width: 440, height: 440, ...sc(2.04, 0.1) }} />
        <svg className="lg-grid" viewBox="0 0 880 540" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <React.Fragment key={i}>
              <line x1={220 + (i + 1) * 55} y1="20" x2={220 + (i + 1) * 55} y2="460" />
              <line x1="220" y1={20 + (i + 1) * 55} x2="660" y2={20 + (i + 1) * 55} />
            </React.Fragment>
          ))}
        </svg>
        {ENDS.map(([x, y], i) => (
          <span key={i} className="lg-c" style={{ left: x - 13, top: y - 13, width: 26, height: 26, ...sc(2.92 + i * 0.03, 0.06) }}>
            {i === 0 && <em>Stroke 24 · round ends</em>}
          </span>
        ))}
        {/* 4. the mark: outline drawn, anchors placed, the line thickens, then it is solid */}
        <svg className="lg-mark" x="0" y="0" viewBox="0 0 880 540" aria-hidden="true">
          <svg x="290" y="30" width="300" height="330" viewBox={MARK_VB}>
            {SKELETON.map(([d, a, dd]) => (
              <path key={d} className="lg-skel" d={d} pathLength={1} style={sc(a, dd)} />
            ))}
            <path className="lg-outline" d={MARK_D} pathLength={1} style={sc(3.0, 0.3)} />
            <path className="lg-fill" d={MARK_D} />
          </svg>
        </svg>
        {ANCHORS.map(([x, y], i) => (
          <i key={i} className="lg-anc" style={{ left: x, top: y, ...sc(3.02 + i * 0.08, 0.03) }} />
        ))}
        {/* 5. wordmark, letter by letter */}
        <p className="lg-word">
          {LOGO.name.split("").map((ch, i) => (
            <span key={i} className="hw" style={sc(4.05 + i * 0.05, 0.12)}>
              {ch}
            </span>
          ))}
          <span className="lg-period">.</span>
        </p>
        <span className="lb lg-track">Tracking −20 · Display 44</span>
      </div>
      {/* 7. variations */}
      <div className="lg-tile lg-dark" style={{ left: 470, top: 40, width: 190, height: 190, ...sc(6.2, 0.12), ...dv(80, -60) }}>
        <Mark fill={c} />
        <small>On dark</small>
      </div>
      <div className="lg-tile lg-red" style={{ left: 670, top: 40, width: 190, height: 190, ...sc(6.28, 0.12), ...dv(120, -40) }}>
        <Mark fill={ink} />
        <small>On colour</small>
      </div>
      <div className="lg-tile lg-fav" style={{ left: 470, top: 250, width: 120, height: 120, ...sc(6.36, 0.12), ...dv(60, 60) }}>
        <Mark fill={c} />
        <small>Favicon · 32 px</small>
      </div>
      <div className="lg-tile lg-card" style={{ left: 610, top: 250, width: 250, height: 120, ...sc(6.44, 0.12), ...dv(120, 60) }}>
        <Mark fill={c} />
        <b>
          {LOGO.name}
          <span className="red-on">.</span>
        </b>
        <small>{LOGO.email}</small>
      </div>
      <span className="lg-export" style={{ ...sc(6.7, 0.08), ...dv(40, 80) }}>
        Export · SVG · PNG · PDF
      </span>
    </>
  );
}

/* ---------------- flyer ---------------- */
function FlyerScene() {
  const [photo, setPhoto] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const im = imgRef.current;
    if (im && im.complete && im.naturalWidth > 0) setPhoto(true);
  }, []);
  let w = 0; // word counter for the headline blur
  const word = (txt: string, cls: string, a: number) => (
    <span className={"hw " + cls} style={sc(a, 0.2)}>
      {txt}
    </span>
  );
  return (
    <>
      <div className={"fl-group" + (photo ? " has-photo" : "")}>
        {/* 2. the blank page, bleed, safe area, crop marks */}
        <div className="box fl-bleed" style={{ left: 228, top: -10, width: 423, height: 560, ...sc(1.32, 0.15) }} />
        <div className="box fl-sheet" style={{ left: 238, top: 0, width: 403, height: 540, ...sc(1.0, 0.25) }}>
          {/* 5. the sky paints down */}
          <span className="fl-sky" style={sc(4.5, 0.45)} />
        </div>
        <div className="box fl-safe" style={{ left: 262, top: 24, width: 355, height: 492, ...sc(1.5, 0.15) }} />
        <svg className="fl-crops" viewBox="0 0 880 540" aria-hidden="true" style={sc(1.68, 0.12)}>
          <path d="M238 -30V-14M218 0H202M641 -30V-14M661 0H677M238 570V554M218 540H202M641 570V554M661 540H677" />
        </svg>
        {/* 3. layout boxes; 4. type; 5. colour */}
        <div className="box fl-img" style={{ left: 328, top: 175, width: 225, height: 365, ...sc(2.04, 0.1) }}>
          <svg className="x" viewBox="0 0 225 365" preserveAspectRatio="none" style={sc(2.14, 0.06)}>
            <path d="M0 0L225 365M225 0L0 365" pathLength={1} />
          </svg>
          <span className="fl-cap">Photo</span>
        </div>
        <div className="fl-built">
          <div className="box fl-t fl-h1" style={{ left: 281, top: 45, width: 284, height: 71, ...sc(2.16, 0.08) }}>
            <span className="t">{word(FLYER.h1, "fl-y", 3.05 + 0.1 * w++)}</span>
          </div>
          <div className="box fl-t fl-h2" style={{ left: 267, top: 130, width: 128, height: 27, ...sc(2.26, 0.05) }}>
            <span className="t">{word(FLYER.h2, "fl-y", 3.05 + 0.1 * w++)}</span>
          </div>
          <div className="box fl-t fl-h3" style={{ left: 395, top: 121, width: 234, height: 88, ...sc(2.33, 0.08) }}>
            <span className="t">{word(FLYER.h3, "fl-y", 3.05 + 0.1 * w++)}</span>
          </div>
          <div className="box fl-t fl-side" style={{ left: 535, top: 268, width: 100, height: 56, ...sc(2.43, 0.04) }}>
            <span className="t">
              {FLYER.side.map(([line, hi], i) => (
                <React.Fragment key={i}>
                  <T text={line} a={3.52 + i * 0.06} b={3.58 + i * 0.06} className={hi ? "fl-y" : "fl-w"} />
                  <br />
                </React.Fragment>
              ))}
            </span>
          </div>
          <div className="box fl-t fl-mini" style={{ left: 422, top: 376, width: 40, height: 22, ...sc(2.49, 0.02) }}>
            <span className="t">
              <T text={FLYER.mini} a={3.78} b={3.84} className="fl-w" />
            </span>
          </div>
          <div className="box fl-t fl-summer" style={{ left: 309, top: 412, width: 264, height: 38, ...sc(2.53, 0.07) }}>
            <span className="t">{word(FLYER.summer, "fl-w", 3.3)}</span>
          </div>
          <div className="box fl-t fl-tags" style={{ left: 307, top: 457, width: 266, height: 16, ...sc(2.62, 0.05) }}>
            <span className="t">
              <T text={FLYER.tags} a={3.4} b={3.52} className="fl-w" />
            </span>
          </div>
          <svg className="fl-swoosh" viewBox="0 0 880 540" aria-hidden="true">
            <path d="M336 483Q440 476 545 478" pathLength={1} style={sc(3.86, 0.08)} />
            <path d="M350 492Q440 487 530 489" pathLength={1} style={sc(3.9, 0.08)} />
          </svg>
        </div>
        {/* 6. the finished flyer paints in over everything; the built type underneath matches it */}
        {FLYER.image && (
          <span className="fl-photo" style={sc(5.05, 0.45)}>
            <img ref={imgRef} src={FLYER.image} alt="" onLoad={() => setPhoto(true)} onError={() => setPhoto(false)} />
          </span>
        )}
      </div>
      {/* labels beside the page */}
      <span className="lb fl-lb" style={{ left: 662, top: 0 }}>
        A4 · 210 × 297 mm
      </span>
      <span className="lb fl-lb is-red" style={{ left: 662, top: 20 }}>
        3 mm bleed
      </span>
      <span className="lb fl-lb is-muted" style={{ left: 662, top: 40 }}>
        Safe area
      </span>
      <span className="lb fl-lb fl-cmyk" style={{ left: 662, top: 64 }}>
        CMYK · 300 dpi · crop marks
      </span>
      {/* export */}
      <div className="fl-export" style={{ left: 662, top: 470, ...sc(5.58, 0.08) }}>
        <span>Export flyer.pdf</span>
        <i />
        <small>Print-ready ✓</small>
      </div>
      {/* 7. pinned up */}
      <span className="fl-pin" />
    </>
  );
}

/* ---------------- system ---------------- */
const BARS = [90, 120, 70, 150, 110, 180, 60]; // bookings per day this week; the 6th is today
function SystemScene() {
  const S = SYSTEM;
  const ents: [string, string[], number, number, number][] = [
    ["Customers", ["name", "phone", "visits"], 110, 150, 1.0],
    ["Bookings", ["date · time", "service", "status"], 345, 250, 1.15],
    ["Staff", ["name", "role", "hours"], 580, 150, 1.3],
  ];
  return (
    <>
      {/* 2. the map: what connects to what */}
      <div className="sy-map">
        {ents.map(([name, fields, x, y, a], i) => (
          <div key={name} className="box sy-ent" style={{ left: x, top: y, width: 190, height: 130, ...sc(a, 0.12) }}>
            <span className="t">
              <b>
                <T text={name} a={1.45 + i * 0.05} b={1.5 + i * 0.05} />
              </b>
              {fields.map((f, j) => (
                <span key={f} className="sy-field">
                  <T text={f} a={1.52 + i * 0.06 + j * 0.02} b={1.54 + i * 0.06 + j * 0.02} />
                </span>
              ))}
            </span>
          </div>
        ))}
        <svg className="sy-links" viewBox="0 0 880 540" aria-hidden="true">
          <path d="M300 215C325 215 320 315 345 315" pathLength={1} style={sc(1.75, 0.1)} />
          <path d="M580 215C555 215 560 315 535 315" pathLength={1} style={sc(1.87, 0.1)} />
        </svg>
        <span className="lb sy-lb" style={{ left: 286, top: 280 }}>1 → many</span>
        <span className="lb sy-lb" style={{ left: 548, top: 280 }}>1 → many</span>
      </div>

      {/* 3-7. the app */}
      <div className="sy-app">
        <div className="box sy-frame" style={{ left: 80, top: 40, width: 720, height: 460, ...sc(2.2, 0.1) }} />
        <div className="box sy-side" style={{ left: 80, top: 40, width: 150, height: 460, ...sc(2.32, 0.05) }}>
          <span className="t">
            <b className="sy-brand">
              <T text={S.app} a={3.0} b={3.05} />
              <span className="red-on">.</span>
            </b>
            {S.nav.map((n, i) => (
              <span key={n} className={"sy-nav" + (i === 0 ? " is-on" : "")}>
                <T text={n} a={3.06 + i * 0.04} b={3.1 + i * 0.04} />
              </span>
            ))}
          </span>
        </div>
        <div className="box sy-top" style={{ left: 230, top: 40, width: 570, height: 50, ...sc(2.385, 0.025) }}>
          <span className="t">
            <T text={S.greeting} a={3.26} b={3.34} />
          </span>
        </div>
        <div className="box sy-btn" style={{ left: 660, top: 50, width: 126, height: 30, ...sc(2.425, 0.025) }}>
          <span className="t">
            <T text={S.action} a={3.34} b={3.4} />
          </span>
        </div>
        {S.stats.map(([label, num], i) => (
          <div key={label} className={"box sy-stat" + (i === 2 ? " is-alert" : "")} style={{ left: 250 + i * 180, top: 110, width: 170, height: 80, ...sc(2.47 + i * 0.045, 0.035) }}>
            <span className="t">
              <small>
                <T text={label} a={3.36 + i * 0.05} b={3.4 + i * 0.05} />
              </small>
              <strong>
                <T text={num} a={3.4 + i * 0.05} b={3.46 + i * 0.05} />
              </strong>
            </span>
          </div>
        ))}
        <div className="box sy-chart" style={{ left: 250, top: 210, width: 260, height: 270, ...sc(2.61, 0.06) }}>
          <span className="t">
            <T text="Bookings this week" a={3.5} b={3.56} />
          </span>
        </div>
        {BARS.map((h, i) => (
          <i key={i} className={"sy-bar" + (i === 5 ? " is-today" : "")} style={{ left: 272 + i * 32, top: 460 - h, height: h, ...sc(3.56 + i * 0.03, 0.12) }} />
        ))}
        <div className="box sy-table" style={{ left: 530, top: 210, width: 250, height: 270, ...sc(2.685, 0.06) }}>
          <span className="t">
            <T text="Today" a={3.6} b={3.63} />
          </span>
        </div>
        {[...S.rows, S.newRow].map(([time, name, status], i) => (
          <div key={i} className={"sy-row" + (i === S.rows.length ? " is-new" : "")} style={{ left: 546, top: 252 + i * 40 }}>
            <span className="sy-time">
              <T text={time} a={3.64 + i * 0.06} b={3.66 + i * 0.06} />
            </span>
            <span className="sy-name">
              <T text={name} a={3.66 + i * 0.06} b={3.7 + i * 0.06} />
            </span>
            <span className={"sy-pill is-" + status.toLowerCase()}>
              <T text={status} a={3.7 + i * 0.06} b={3.72 + i * 0.06} />
            </span>
          </div>
        ))}
        {/* 6. automations: a flow dragged out over the chart, a reminder goes out */}
        <div className="box sy-flow" style={{ left: 250, top: 210, width: 260, height: 270, ...sc(5.05, 0.08) }}>
          <span className="t">
            <small>Automation</small>
          </span>
        </div>
        {S.flow.map((f, i) => (
          <span key={f} className={"sy-node" + (i === 2 ? " is-send" : "")} style={{ left: 270, top: 250 + i * 76, ...sc(5.14 + i * 0.08, 0.06) }}>
            {f}
          </span>
        ))}
        <svg className="sy-wires" viewBox="0 0 880 540" aria-hidden="true">
          <path d="M380 290V326" pathLength={1} style={sc(5.3, 0.05)} />
          <path d="M380 366V402" pathLength={1} style={sc(5.36, 0.05)} />
        </svg>
        <i className="sy-pulse" />
        <div className="sy-toast" style={sc(5.6, 0.06)}>
          <i />
          {S.toast}
        </div>
        {/* 7. the real system pulls down over the demo */}
        <Shot src={S.shot} className="sy-shot" a={6.05} d={0.35} />
      </div>
      {/* 7. live, if the screenshot can't load: on the phone too */}
      <div className="sy-phone" style={{ ...sc(6.22, 0.16), ...dv(80, 40) }}>
        <div className="sy-screen">
          <small>Today</small>
          <b>{S.stats[0][1]} bookings</b>
          {S.rows.slice(0, 3).map(([t, n]) => (
            <span key={t}>
              <em>{t}</em> {n}
            </span>
          ))}
          <span className="is-new">
            <em>{S.newRow[0]}</em> {S.newRow[1]}
          </span>
        </div>
      </div>
    </>
  );
}

/* ---------------- video ---------------- */
/* the footage: a city at night, drawn. crop picks which part of it a shot shows (x, y, zoom) */
const CITY: [number, number, number][] = [
  [0, 34, 70], [30, 26, 96], [52, 40, 58], [88, 30, 112], [114, 22, 80], [132, 44, 64], [172, 28, 124], [196, 36, 88],
  [228, 24, 102], [248, 40, 70], [284, 36, 92],
];
export function NightShot({
  crop = [0, 0, 1],
  title,
  className,
  box,
}: {
  crop?: [number, number, number];
  title?: string;
  className?: string;
  box?: { x: number; y: number; width: number; height: number }; // when nested inside another svg
}) {
  const id = "ns" + React.useId().replace(/:/g, "");
  const [cx, cy, z] = crop;
  return (
    <svg className={className} {...box} viewBox={`${cx} ${cy} ${320 / z} ${180 / z}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1530" />
          <stop offset=".62" stopColor="#2c2552" />
          <stop offset="1" stopColor="#d0694c" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id})`} />
      {[[30, 20], [80, 34], [140, 14], [196, 28], [300, 18], [120, 46]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r=".9" fill="#fff" opacity=".7" />
      ))}
      <circle cx="252" cy="38" r="13" fill="#f3e6c4" />
      {CITY.map(([x, w, h], i) => (
        <g key={x}>
          <rect x={x} y={168 - h} width={w} height={h} fill="#0c0f18" />
          {Array.from({ length: Math.floor((h - 10) / 9) * Math.floor((w - 6) / 7) }, (_, k) => {
            const cols = Math.floor((w - 6) / 7);
            const c = k % cols;
            const r = Math.floor(k / cols);
            return (k * 7 + i * 3) % 5 < 2 ? <rect key={k} x={x + 5 + c * 7} y={168 - h + 7 + r * 9} width="3" height="4" fill="#ffc56b" /> : null;
          })}
        </g>
      ))}
      <rect y="166" width="320" height="14" fill="#07080d" />
      <ellipse cx="160" cy="170" rx="150" ry="6" fill="#ff8a4c" opacity=".28" />
      {title && (
        <text x={cx + 160 / z} y={cy + 96 / z} textAnchor="middle" fontSize={26 / z} fontWeight={800} fill="#fff" className="ns-title">
          {title}
          <tspan fill="#ed1d04">.</tspan>
        </text>
      )}
    </svg>
  );
}
const VD_CROPS: [number, number, number][] = [[0, 0, 1], [150, 40, 2], [60, 70, 1.8], [190, 10, 2.4], [20, 50, 1.5], [230, 90, 2.2]];
const WAVE = Array.from({ length: 64 }, (_, i) => 6 + Math.abs(Math.sin(i * 1.7) * 14 + Math.sin(i * 0.43) * 9));
function VideoScene() {
  const V = VIDEO;
  return (
    <>
      <div className="vd-app">
        {/* 2. the footage bin */}
        <div className="box vd-bin" style={{ left: 40, top: 40, width: 260, height: 300, ...sc(1.0, 0.15) }}>
          <span className="t">
            <T text={`Footage · ${V.clips.length} clips`} a={1.18} b={1.25} />
          </span>
        </div>
        {V.clips.map(([name, dur], i) => {
          const [cx, cy] = VD_THUMB(i);
          return (
            <div key={name} className="vd-thumb" style={{ left: cx - 55, top: cy - 31, ...sc(1.2 + i * 0.04, 0.08) }}>
              <NightShot crop={VD_CROPS[i]} className="vd-raw" />
              <span className="vd-lab">
                {name} · {dur}
              </span>
              {(i === 2 || i === 5) && <i className="vd-star" style={sc(i === 2 ? 1.53 : 1.65, 0.03)} />}
            </div>
          );
        })}

        {/* 3. the monitor */}
        <div className="box vd-mon" style={{ left: 320, top: 40, width: 520, height: 292, ...sc(2.04, 0.12) }} />
        <div className="vd-screen">
          <div className="vd-pan">
            <NightShot className="vd-raw" />
          </div>
          {/* 5. the grade wipes across, before -> after */}
          <div className="vd-graded" style={sc(4.4, 0.4)}>
            <div className="vd-pan">
              <NightShot />
            </div>
          </div>
          <i className="vd-split" style={sc(4.4, 0.4)} />
          <em className="vd-ba vd-before">before</em>
          <em className="vd-ba vd-after">after</em>
          {/* 6. the title */}
          <span className="vd-title">
            <T text={V.title} a={5.5} b={5.64} />
            <span className="red-on">.</span>
          </span>
          <span className="vd-tc">
            <T text="00:00:58:12 · 24 fps" a={3.05} b={3.15} />
          </span>
          {/* 7. render */}
          <i className="vd-render" />
          <span className="vd-done">Exported · 4K</span>
        </div>

        {/* 3. the timeline */}
        <div className="box vd-tl" style={{ left: 40, top: 352, width: 800, height: 148, ...sc(2.21, 0.12) }} />
        <div className="vd-tracks">
          {Array.from({ length: 19 }, (_, i) => (
            <i key={i} className="vd-tick" style={{ left: 90 + i * 40 }} />
          ))}
          {[["V2", 368], ["V1", 402], ["A1", 452]].map(([n, y]) => (
            <span key={n} className="vd-trk" style={{ top: y as number }}>
              {n}
            </span>
          ))}
          {VD_CLIPS.map(([x, w, t], i) =>
            i === 2 ? (
              <React.Fragment key={i}>
                <span className="vd-clip" style={{ left: x, width: 100, ...sc(2.4 + i * 0.12 + 0.1, 0.03) }}>
                  {V.clips[t][0]}
                </span>
                <span className="vd-clip vd-tail" style={{ left: x + 100, width: w - 100, ...sc(2.4 + i * 0.12 + 0.1, 0.03) }} />
                <i className="vd-cut" style={{ left: x + 100, ...sc(3.22, 0.03) }} />
              </React.Fragment>
            ) : (
              <span key={i} className={"vd-clip" + (i > 2 ? " vd-after-cut" : "")} style={{ left: x, width: w, ...sc(2.4 + i * 0.12 + 0.1, 0.03) }}>
                {V.clips[t][0]}
              </span>
            )
          )}
          {/* 6. title clip, music, beat markers */}
          <span className="box vd-tclip" style={{ left: 220, top: 368, width: 200, height: 22, ...sc(5.35, 0.12) }}>
            <span className="t">Title</span>
          </span>
          {WAVE.map((h, i) => (
            <i key={i} className="vd-wave" style={{ left: 90 + i * 8.6, top: 466 - h / 2, height: h, ...sc(5.03 + i * 0.004, 0.05) }} />
          ))}
          {[220, 320, 420, 540].map((x, i) => (
            <i key={x} className="vd-beat" style={{ left: x - 4, ...sc(5.66 + i * 0.03, 0.03) }} />
          ))}
          <span className="vd-music">
            <T text="Music · 120 bpm" a={5.1} b={5.2} />
          </span>
          <i className="vd-head" />
          <span className="box vd-export" style={{ left: 750, top: 356, width: 80, height: 22, ...sc(2.36, 0.04) }}>
            <span className="t">Export</span>
          </span>
        </div>
      </div>

      {/* 7. delivered: wide, tall and square */}
      {(
        [
          [60, 160, 380, 214, 0, dv(-120, 60)],
          [470, 120, 160, 284, 1, dv(0, -80)],
          [660, 162, 200, 200, 2, dv(120, 60)],
        ] as [number, number, number, number, number, React.CSSProperties][]
      ).map(([x, y, w, h, i, v]) => (
        <div key={i} className={"vd-out" + (i === 0 ? " is-wide" : "")} style={{ left: x, top: y, width: w, height: h, ...sc(6.38 + i * 0.06, 0.12), ...v }}>
          <div className="vd-out__in">
            <NightShot crop={i === 1 ? [100, 0, 1] : [0, 0, 1]} />
            {V.clip ? (
              <video src={V.clip} muted loop autoPlay playsInline />
            ) : (
              <span className="vd-out__t" style={{ fontSize: [30, 22, 22][i] }}>
                {V.title}
                <span className="red-on">.</span>
              </span>
            )}
            {i === 0 && (
              <>
                <i className="vd-play" />
                <i className="vd-prog" />
              </>
            )}
          </div>
          <span className="vd-fmt">
            <b>{V.formats[i][0]}</b> {V.formats[i][1]}
          </span>
        </div>
      ))}
    </>
  );
}

const SCENES: { key: Key; tab: string; intro: string; ask: string; reply: string; steps: { title: string; text: string }[] }[] = [
  { key: "web", ...WEB },
  { key: "system", ...SYSTEM },
  { key: "logo", ...LOGO },
  { key: "flyer", ...FLYER },
  { key: "video", ...VIDEO },
];

/* build: which build to play first. tabs: show the Website / System / Logo / Flyer / Video switcher.
   onCta: called before the contact overlay opens (the services panels use it to close the full-screen build). */
export default function ProcessBuild({ build = "web", tabs = true, onCta }: { build?: Key; tabs?: boolean; onCta?: () => void } = {}) {
  const secRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const curRef = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(-1);
  const [scale, setScale] = useState(1);
  const [reduced, setReduced] = useState(false);
  const [key, setKey] = useState<Key>(build);
  const keyRef = useRef<Key>(build);
  const titleId = "lns-pb-title-" + React.useId().replace(/:/g, "");
  const cta = () => {
    onCta?.();
    openContactOverlay();
  };
  const typedRef = useRef<{ on: HTMLElement; off: HTMLElement; text: string; a: number; b: number; n: number }[]>([]);
  const paintRef = useRef<() => void>(() => {});
  const [shot, setShot] = useState(false); // the real screenshot loaded
  const scene = SCENES.find((s) => s.key === key)!;
  const steps = [...scene.steps, LAST];

  // collect the self-typing texts of the current build (again whenever the tab changes)
  useLayoutEffect(() => {
    keyRef.current = key;
    setShot(false);
    const pin = pinRef.current;
    if (!pin) return;
    typedRef.current = Array.from(pin.querySelectorAll<HTMLElement>("[data-ty]")).map((el) => ({
      on: el.firstElementChild as HTMLElement,
      off: el.lastElementChild as HTMLElement,
      text: el.dataset.ty || "",
      a: Number(el.dataset.a),
      b: Number(el.dataset.b),
      n: -1,
    }));
    paintRef.current();
  }, [key]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    const sec = secRef.current!;
    const pin = pinRef.current!;

    const fit = () => {
      const w = pin.clientWidth;
      const h = pin.clientHeight;
      const narrow = w < 720;
      const room = reduce ? 9999 : h - (narrow ? 380 : 300); // leave space for the labels and tabs
      setScale(Math.max(0.2, Math.min((w - (narrow ? 32 : 120)) / W, room / (H + 60), 1.05)));
    };

    // q = playhead in steps (0..N). It eases toward the scroll position, so wheel ticks still look smooth.
    let q = 0;
    let target = 0;
    let raf = 0;
    let lastStep = -2;
    const paint = () => {
      const k = keyRef.current;
      pin.style.setProperty("--q", q.toFixed(4));
      pin.classList.toggle("shot-in", q > (SHOT_IN[k] ?? 99)); // the demo under a finished screenshot can go
      const s = q <= 0.02 ? -1 : Math.min(N - 1, Math.floor(q));
      if (s !== lastStep) {
        lastStep = s;
        setStep(s);
      }
      if (numRef.current) numRef.current.textContent = String(Math.min(100, Math.round((q / (N - 1)) * 100))).padStart(3, "0");
      const cur = curRef.current;
      if (cur) {
        const r = routeAt(ROUTES[k], q);
        const vis = Math.min(1, Math.max(0, (q - 0.82) / 0.1)) * (1 - Math.min(1, Math.max(0, (q - 7.6) / 0.1)));
        cur.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
        cur.style.opacity = vis.toFixed(3);
        cur.classList.toggle("is-down", r.down);
        cur.classList.toggle("is-carrying", q > CARRY[k][0] && q < CARRY[k][1]);
      }
      for (const t of typedRef.current) {
        const kk = Math.min(1, Math.max(0, (q - t.a) / (t.b - t.a)));
        const n = Math.round(kk * t.text.length);
        if (n === t.n) continue;
        t.n = n;
        t.on.textContent = t.text.slice(0, n);
        t.off.textContent = t.text.slice(n); // still laid out (invisible), so lines never re-wrap while typing
      }
    };
    paintRef.current = paint;
    const loop = () => {
      raf = 0;
      const d = target - q;
      q = Math.abs(d) < 0.0006 ? target : q + d * 0.16;
      paint();
      if (q !== target) raf = requestAnimationFrame(loop);
    };
    const read = () => {
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      target = p * N;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(pin);
    if (reduce) {
      q = target = N - 1.01; // the finished piece, no pinning, no motion
      paint();
      return () => ro.disconnect();
    }
    read();
    q = target;
    paint();
    // capture:true also catches scrolling inside a container (smooth-scroll wrappers, overflow:auto mains)
    document.addEventListener("scroll", read, { passive: true, capture: true });
    window.addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("scroll", read, { capture: true });
      window.removeEventListener("resize", read);
    };
  }, []);

  const skip = () => secRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  // a new tab starts its build from the beginning
  const pick = (k: Key) => {
    if (k === key) return;
    setKey(k);
    const sec = secRef.current;
    if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: "start" });
  };

  let cls = `lns-pb__pin is-${key}` + (shot ? " has-shot" : "");
  for (let k = 0; k <= step; k++) cls += ` ge${k}`;
  cls += ` at${step}`;

  return (
    <section
      ref={secRef}
      className={"lns-pb" + (reduced ? " is-static" : "")}
      style={reduced ? undefined : { height: `${LENGTH * 100 + 100}vh` }}
      aria-labelledby={titleId}
    >
      <style>{CSS}</style>
      <div ref={pinRef} className={cls}>
        <header className="lns-pb__head">
          <p className="lns-pb__eyebrow">{EYEBROW}</p>
          <h2 id={titleId} className="lns-pb__intro">{scene.intro}</h2>
        </header>
        {tabs && (
          <div className="lns-pb__tabs" role="tablist" aria-label="What gets built">
            {SCENES.map((s) => (
              <button key={s.key} type="button" role="tab" aria-selected={s.key === key} onClick={() => pick(s.key)}>
                {s.tab}
              </button>
            ))}
          </div>
        )}
        <div className="lns-pb__meter" aria-hidden="true">
          <span className="lns-pb__meter-label">Build progress</span>
          <span className="lns-pb__num">
            <span ref={numRef}>000</span>
            <small>%</small>
          </span>
        </div>

        {/* the stage, drawn at 880x540 and scaled to fit */}
        <div className="lns-pb__stagewrap" aria-hidden={step < N - 1}>
          <div
            className="lns-pb__stage"
            style={{
              width: W,
              height: H,
              transform: `translate(-50%,-50%) scale(${scale})`,
              ["--s" as any]: scale,
              ["--tx" as any]: key === "web" ? "315px" : "0px",
              ["--ty" as any]: key === "web" ? "-126px" : "0px",
            }}
          >
            {/* the page of the demo site: always light, even when the rest of the site is in dark mode */}
            {key === "web" && <div className="sheet" style={sc(1.78, 0.2)} />}

            {/* 1. guides draw outwards, crosshairs, the point that opens the chat */}
            {[96, 150, 330, 422].map((y, i) => (
              <i key={"h" + y} className="g gh" style={{ top: y, ...sc(0.05 + i * 0.07, 0.35) }} />
            ))}
            {[440, 40].map((x, i) => (
              <i key={"v" + x} className="g gv" style={{ left: x, ...sc(0.1 + i * 0.1, 0.35) }} />
            ))}
            {[
              [0, 0],
              [W, 0],
              [0, H],
              [W, H],
            ].map(([x, y], i) => (
              <span key={`${x}-${y}`} className="cross" style={{ left: x, top: y, ...sc(0.15 + i * 0.05, 0.25) }}>
                <em>
                  x {x} · y {y}
                </em>
              </span>
            ))}
            <span className="point" style={{ left: 240, top: 330, ...sc(0.08, 0.22) }} />

            {/* everything that belongs to the chosen build; re-mounts (and fades in) when the tab changes */}
            <div className="scene" key={key} style={{ ["--logo-c" as any]: LOGO.colour } as React.CSSProperties}>
              <div className="chat ask" style={{ left: 240, top: 262, ...sc(0.08, 0.22) }}>
                <small>Client</small>
                <T text={scene.ask} a={0.24} b={0.5} />
              </div>
              <div className="chat reply" style={{ left: 380, top: 346, ...sc(0.52, 0.1) }}>
                <small>Me</small>
                <T text={scene.reply} a={0.58} b={0.7} />
              </div>
              <ShotCtx.Provider value={setShot}>
              {key === "web" && <WebScene />}
              {key === "logo" && <LogoScene />}
              {key === "flyer" && <FlyerScene />}
              {key === "system" && <SystemScene />}
              {key === "video" && <VideoScene />}
              </ShotCtx.Provider>
              {key === "web" ? null : <span className="endcard" />}
            </div>

            {/* colour swatches */}
            <div className={"swatches" + (step === COLOUR_STEP[key] ? " on" : "")}>
              {SWATCHES[key].map(([n, c]) => (
                <span key={n}>
                  <b style={{ background: c }} />
                  {n} <em>{c}</em>
                </span>
              ))}
            </div>

            {/* 8. aim lines and the hand-written nudge around the last button */}
            <span className="aim" aria-hidden="true">
              <i className="ah" style={{ top: 0 }} />
              <i className="ah" style={{ top: 52 }} />
              <i className="av" style={{ left: 0 }} />
              <i className="av" style={{ left: 170 }} />
              <em>{CTA} · 170 × 52</em>
              <span className="note">
                <svg viewBox="0 0 60 50" aria-hidden="true">
                  <path d="M54 4C40 6 22 16 12 42M12 42l-2-12M12 42l10-6" pathLength={1} />
                </svg>
                <span>{NOTE}</span>
              </span>
            </span>
            {key === "web" ? (
              <button
                key="web-btn"
                type="button"
                className="box btn1"
                style={{ left: 40, top: 370, width: 170, height: 52, ...sc(2.56, 0.06) }}
                tabIndex={step === N - 1 || reduced ? 0 : -1}
                onClick={cta}
              >
                <span className="t">
                  <T text={CTA} a={3.55} b={3.68} />
                </span>
                <span className="go">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                key="solo-btn"
                type="button"
                className="btn1 solo"
                style={{ left: 355, top: 244, width: 170, height: 52 }}
                tabIndex={step === N - 1 || reduced ? 0 : -1}
                onClick={cta}
              >
                <span className="t">{CTA}</span>
                <span className="go">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </button>
            )}

            {/* the pointer that builds it all */}
            <span ref={curRef} className="cursor" style={{ opacity: 0, ["--carry" as any]: CARRY_COLOUR[key] } as React.CSSProperties}>
              <span className="cursor__in">
                <i className="cursor__press" />
                <i className="cursor__carry" />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 2.5v17.2l4.6-4.4 2.9 6.6 3.1-1.4-2.9-6.5h6.4z" />
                </svg>
              </span>
            </span>
          </div>
        </div>

        {/* step captions */}
        <div className="lns-pb__caps" aria-live="polite">
          {steps.map((s, i) => (
            <div key={key + i} className={"lns-pb__cap" + (i === Math.max(0, step) ? " is-on" : "")}>
              <p className="lns-pb__count">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i />
                {String(N).padStart(2, "0")}
              </p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        {!reduced && (
          <button type="button" className="lns-pb__skip" onClick={skip}>
            Skip the build
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Barlow+Condensed:ital,wght@0,600;1,800&display=swap");
.lns-pb{
  /* the section around the demo: these follow your theme (see the dark-mode rule in the prompt) */
  --pb-paper:#cdc9c3;--pb-ink:#28272a;--pb-red:#ed1d04;--pb-muted:#5e5a57;--pb-line:rgba(40,39,42,.22);
  --pb-keepcard:0; /* 1 in dark mode: the light card stays around the final button so it doesn't sink into the dark */
  /* the demo website being built: fixed light colours, never themed */
  --site-paper:#cdc9c3;--site-ink:#28272a;--site-muted:#5e5a57;
  --pb-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --pb-hand:"Caveat","Segoe Print","Bradley Hand",cursive;
  --pb-poster:"Barlow Condensed","Arial Narrow",sans-serif;
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;
  --lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;
  --e:cubic-bezier(.22,.61,.36,1);
  position:relative;color:var(--pb-ink);font-family:var(--lns-body);
}
.lns-pb *,.lns-pb *::before,.lns-pb *::after{box-sizing:border-box}
/* stays on screen while the section scrolls past; the panel around it needs overflow:clip (not hidden) */
.lns-pb__pin{position:sticky;top:0;height:100vh;height:100svh;overflow:clip;--q:0}

.lns-pb__head{position:absolute;left:clamp(16px,4vw,56px);top:clamp(24px,5vh,48px);margin:0;z-index:3}
.lns-pb__eyebrow{margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-muted)}
.lns-pb__intro{margin:0;font-family:var(--lns-body);font-size:15px;font-weight:500;letter-spacing:0}
.lns-pb__meter{position:absolute;right:clamp(16px,4vw,56px);top:clamp(24px,5vh,48px);text-align:right;z-index:3}
.lns-pb__meter-label{display:block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-muted)}
.lns-pb__num{display:block;font-family:var(--lns-display);font-weight:600;font-size:clamp(44px,6vw,84px);line-height:1;
  color:color-mix(in srgb, var(--pb-ink) 16%, transparent);font-variant-numeric:tabular-nums}
.lns-pb__num small{font-size:.32em;margin-left:2px}
.lns-pb.is-static .lns-pb__num{color:var(--pb-ink)}

.lns-pb__stagewrap{position:absolute;inset:0;pointer-events:none}
.lns-pb__stage{position:absolute;left:50%;top:50%;transform-origin:50% 50%;
  --end:max(1.3, calc(1.25 / var(--s, 1)));
  /* the ending, scrubbed: e1 the site breaks apart, e2 the button glides to the centre, e3 aim lines, e4 the note */
  --e1:clamp(0, calc((var(--q) - 7) / .32), 1);
  --e2:clamp(0, calc((var(--q) - 7.28) / .3), 1);
  --e3:clamp(0, calc((var(--q) - 7.55) / .18), 1);
  --e4:clamp(0, calc((var(--q) - 7.68) / .24), 1)}
.lns-pb__stage *{position:absolute}
.lns-pb__stage .t,.lns-pb__stage .bars,.lns-pb__stage s,.lns-pb__stage code,.lns-pb__stage code *,.lns-pb__stage .code__ln span,
.lns-pb__stage .swatches span,.lns-pb__stage .swatches b,.lns-pb__stage .swatches em,.lns-pb__stage .code__bar b,.lns-pb__stage .bar b,
.lns-pb__stage .url,.lns-pb__stage .url i,.lns-pb__stage .red,.lns-pb__stage br,.lns-pb__stage .go svg,.lns-pb__stage svg path,
.lns-pb__stage .ty,.lns-pb__stage .ty *,.lns-pb__stage .hw,.lns-pb__stage .chat small{position:static}
.lns-pb__stage em{font-style:normal}
/* scrub progress for anything with --a (start) and --d (duration), both in steps */
.lns-pb__stage [style*="--a"]{--k:clamp(0, calc((var(--q) - var(--a)) / var(--d)), 1)}
/* state changes (colour, live) still ease; scroll-scrubbed properties don't, the playhead is already smoothed */
.lns-pb__stage *{transition:background-color .5s var(--e),border-color .5s var(--e),color .5s var(--e),box-shadow .6s var(--e)}
.ty__off{color:transparent!important}

/* ---- 1. guides, crosshairs, the point ---- */
.g{background:var(--pb-red);
  opacity:calc(var(--k) * (.75 - .47 * clamp(0, calc((var(--q) - 2) / .5), 1)) * (1 - clamp(0, calc((var(--q) - 3.6) / .4), 1)))}
.gh{left:-60vw;right:-60vw;height:1px;transform:scaleX(var(--k))}
.gv{top:-60vh;bottom:-60vh;width:1px;transform:scaleY(var(--k))}
.cross{width:18px;height:18px;margin:-9px 0 0 -9px;opacity:calc(var(--k) * (1 - clamp(0, calc((var(--q) - 2.6) / .4), 1)))}
.cross::before,.cross::after{content:"";position:absolute;background:var(--pb-ink)}
.cross::before{left:8px;top:0;width:1px;height:18px}
.cross::after{top:8px;left:0;height:1px;width:18px}
.cross em{left:16px;top:-14px;white-space:nowrap;font:10px/1 var(--pb-mono);color:var(--pb-muted)}
/* the point grows into the corner of a chat bubble; the chat then slides away */
.point{width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--pb-red);opacity:calc(1 - var(--k));transform:scale(calc(1 + var(--k)))}
.chat{--sl:clamp(0, calc((var(--q) - .78) / .3), 1);padding:10px 16px 12px;font:15px/1.35 var(--lns-body, system-ui, sans-serif);white-space:nowrap;
  opacity:calc(min(1, var(--k) * 3) * (1 - var(--sl)));
  transform:translate(calc(var(--sl) * -220px), calc(var(--sl) * -40px)) scale(calc(var(--k) * max(1, calc(.6 / var(--s, 1)))))}
.chat small{display:block;margin-bottom:3px;font:600 10px/1 var(--lns-body, system-ui, sans-serif);letter-spacing:.12em;text-transform:uppercase;opacity:.6}
.chat.ask{height:68px;border-radius:20px 20px 20px 4px;background:#ebe9e6;color:var(--site-ink);border:1px solid rgba(40,39,42,.18);transform-origin:0 100%;
  box-shadow:0 14px 30px -18px rgba(40,39,42,.5)}
.chat.reply{border-radius:20px 20px 4px 20px;background:var(--pb-ink);color:var(--pb-paper);transform-origin:100% 0}
.chat.reply small{color:var(--pb-red);opacity:1}

/* ---- 2. grid ---- */
.cols{left:40px;right:40px;top:44px;bottom:12px;display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.cols span{position:relative;background:rgba(237,29,4,.1);transform:scaleY(var(--k));transform-origin:top;
  opacity:calc((1 - .55 * clamp(0, calc((var(--q) - 2.4) / .4), 1)) * (1 - clamp(0, calc((var(--q) - 3.7) / .3), 1)))}

/* ---- 3. layout ---- */
.sheet{inset:0;border-radius:14px;background:var(--site-paper);
  opacity:calc(min(1, var(--k) * 6) * (1 - var(--e2) * (1 - var(--pb-keepcard))));
  clip-path:inset(calc(var(--e1) * 354px) calc((1 - var(--k)) * 100% + var(--e1) * 654px) calc((1 - var(--k)) * 100% + var(--e1) * 102px) calc(var(--e1) * 24px) round calc(14px + var(--e1) * 18px));
  transform:translate(calc(var(--e2) * 315px), calc(var(--e2) * -126px)) scale(calc(.97 + .03 * var(--k)))}
.at7 .sheet{transform:translate(calc(var(--e2) * 315px), calc(var(--e2) * -126px)) scale(calc(1 + var(--e2) * (var(--end) - 1)));transform-origin:125px 396px}
.frame{inset:0;border:1px solid rgba(40,39,42,.45);border-radius:14px;background:rgba(255,255,255,0);color:var(--site-ink);
  opacity:calc(min(1, var(--k) * 6) * (1 - var(--e2)));
  /* 8: the frame shrinks to a card around the button, then travels with it and fades */
  clip-path:inset(calc(var(--e1) * 354px) calc((1 - var(--k)) * 100% + var(--e1) * 654px) calc((1 - var(--k)) * 100% + var(--e1) * 102px) calc(var(--e1) * 24px) round calc(14px + var(--e1) * 18px));
  transform:translate(calc(var(--e2) * 315px), calc(var(--e2) * -126px)) scale(calc(.97 + .03 * var(--k)))}
.bar{left:0;right:0;top:0;height:34px;border-bottom:1px solid rgba(40,39,42,.3);display:flex;align-items:center;gap:6px;padding:0 14px;
  opacity:calc(1 - var(--e1))}
.bar b{width:7px;height:7px;border-radius:50%;background:rgba(40,39,42,.3)}
.url{display:inline-flex;align-items:center;gap:6px;margin-left:auto;margin-right:auto;padding:3px 12px;border-radius:999px;
  font:11px/1.2 var(--lns-body, system-ui, sans-serif);color:var(--site-muted);background:rgba(40,39,42,.06);opacity:0;transition:opacity .5s}
.url i{width:6px;height:6px;border-radius:50%;background:var(--pb-red)}
.ge6 .frame{background:rgba(255,255,255,.25);border-color:rgba(40,39,42,.25);box-shadow:0 30px 70px -30px rgba(40,39,42,.45)}
.ge6 .url{opacity:1}

/* boxes draw from their left edge to their right edge; in step 8 they drift apart and fade */
.box{border:1px solid rgba(40,39,42,.55);border-radius:4px;display:flex;align-items:center;color:var(--site-ink);
  clip-path:inset(-2px calc((1 - var(--k)) * 100% - 1px) calc((1 - var(--k)) * 100% - 1px) -2px);opacity:calc(min(1, var(--k) * 4) * (1 - var(--e1)));
  transform:translate(calc(var(--vx, 0) * var(--e1) * 1px + var(--mx, 0px)), calc(var(--vy, 0) * var(--e1) * 1px))}
.box .bars{display:flex;flex-direction:column;gap:12px;width:100%;padding:12px;opacity:calc(1 - var(--k))}
.box .bars s{display:block;height:12px;border-radius:3px;background:rgba(40,39,42,.14);text-decoration:none}
.box.body .bars s{height:7px}
.box.body .bars{gap:9px;padding:10px}
.pill{border-radius:999px;justify-content:center;font-size:12px;
  /* drawn 110px too far left, then the pointer drags the menu into place */
  --mx:calc(-110px * (1 - clamp(0, calc((var(--q) - 2.91) / .08), 1)))}
.logo{padding:0 8px;font:700 18px/1 var(--lns-display, system-ui, sans-serif);letter-spacing:.01em}
.red{color:var(--pb-red);opacity:0;transition:opacity .5s}
.ge4 .red{opacity:1}
.head{align-items:flex-start;padding:4px 6px}
.head .t{position:absolute;left:6px;top:6px;font-family:var(--lns-display);font-weight:800;font-size:50px;line-height:54px;letter-spacing:-.01em;white-space:nowrap}
/* 4. headline words blur into focus one by one */
.hw{display:inline-block;opacity:var(--k);filter:blur(calc((1 - var(--k)) * 10px));transform:translateY(calc((1 - var(--k)) * 8px))}
.body{align-items:flex-start;padding:4px 6px}
.body .t{position:absolute;left:6px;top:5px;right:6px;font-size:15px;line-height:22px;color:var(--site-muted)}
.btn2{border-radius:999px;justify-content:center;font-size:14px;font-weight:600}
.btn1{--fill:clamp(0, calc((var(--q) - 4.34) / .1), 1);
  border-radius:999px;justify-content:space-between;padding:0 6px 0 22px;font:600 14px/1 var(--lns-body, system-ui, sans-serif);
  background:color-mix(in srgb, var(--site-ink) calc(var(--fill) * 100%), transparent);
  color:color-mix(in srgb, var(--site-paper) calc(var(--fill) * 100%), var(--site-ink));
  border-color:color-mix(in srgb, var(--site-ink) calc(var(--fill) * 100%), rgba(40,39,42,.55));
  cursor:pointer;pointer-events:none;appearance:none;-webkit-appearance:none;opacity:min(1, calc(var(--k) * 4));
  transform:translate(calc(var(--e2) * var(--tx, 0px)), calc(var(--e2) * var(--ty, 0px))) scale(calc((1 + var(--e2) * (var(--end) - 1)) * var(--hov, 1)))}
.btn1 .go{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center}
/* the red dot in the wireframe button grows into the arrow circle when colour arrives */
.btn1 .go::before{content:"";position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:var(--pb-red);
  transform:scale(calc(.2 + .8 * var(--fill)))}
.btn1 .go svg{position:relative;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:var(--fill);color:#fff}
/* image: the X draws in, then the artwork wipes down over it */
.img{overflow:hidden;border-radius:6px}
.img .x,.fl-img .x{inset:0;width:100%;height:100%;fill:none;stroke:rgba(40,39,42,.5);stroke-width:1;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k));
  opacity:calc(1 - clamp(0, calc((var(--q) - 4.5) / .3), 1))}
.img .x path,.fl-img .x path{vector-effect:non-scaling-stroke}
.img .art{inset:0;background:var(--site-ink);clip-path:inset(0 0 calc((1 - var(--k)) * 100%) 0)}
.moon{left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:var(--pb-red)}
.moon::after{content:"";position:absolute;width:104px;height:104px;border-radius:50%;background:var(--site-ink);left:34px;top:-8px}
.star{width:4px;height:4px;border-radius:50%;background:var(--site-paper)}
/* colour: the wireframe fills in */
.ge4 .btn2{border-color:var(--site-ink)}
/* live: the scaffolding disappears */
.ge6 .box:not(.btn1):not(.btn2):not(.pill){border-color:transparent}
.ge6 .pill{border-color:rgba(40,39,42,.25)}

/* measurements (type -> code) */
.label{opacity:0;font:10px/1 var(--pb-mono);color:var(--pb-red);transition:opacity .4s}
.font{white-space:nowrap}
.wbar{height:1px;background:var(--pb-red)}
.wbar em{left:50%;top:6px;transform:translateX(-50%)}
.hbar{width:1px;background:var(--pb-red)}
.hbar em{right:6px;top:50%;transform:translateY(-50%)}
.vbar{width:1px;background:var(--pb-red)}
.vbar em{left:6px;top:50%;transform:translateY(-50%)}
.ge3 .label{opacity:1}
.ge6 .label{opacity:0}

/* ---- 5. swatches ---- */
.swatches{left:0;top:-58px;display:flex;gap:22px;opacity:0;transform:translateY(10px);transition:opacity .5s var(--e),transform .5s var(--e)}
.swatches span{display:flex;align-items:center;gap:8px;width:120px;font:600 12px/1 var(--lns-body, system-ui, sans-serif)}
.swatches b{display:block;width:26px;height:26px;border-radius:50%;border:1px solid color-mix(in srgb, var(--pb-ink) 35%, transparent)}
.swatches em{font:400 10px/1 var(--pb-mono);color:var(--pb-muted)}
.swatches.on{opacity:1;transform:none}

/* ---- the pointer ---- */
.cursor{left:0;top:0;z-index:20;will-change:transform}
.cursor__in{left:0;top:0;transform:scale(max(1, calc(.75 / var(--s, 1))));transform-origin:0 0}
.cursor svg{position:absolute;left:-3px;top:-2px;width:26px;height:26px;overflow:visible;fill:var(--site-ink);stroke:#fff;stroke-width:1.4;stroke-linejoin:round;
  filter:drop-shadow(0 3px 4px rgba(0,0,0,.28));transition:transform .15s var(--e)}
.cursor.is-down svg{transform:scale(.86)}
.cursor__press{left:-11px;top:-11px;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--pb-red);opacity:0;transform:scale(.4);
  transition:opacity .2s,transform .25s var(--e)}
.cursor.is-down .cursor__press{opacity:.9;transform:none}
.cursor__carry{left:6px;top:10px;width:22px;height:22px;border-radius:50%;background:var(--carry, var(--pb-red));opacity:0;transform:scale(.3);
  box-shadow:0 6px 12px -4px rgba(237,29,4,.6);transition:opacity .15s,transform .2s var(--e)}
.cursor.is-carrying .cursor__carry{opacity:1;transform:none}
.lns-pb.is-static .cursor{display:none}

/* ---- 6. code: appears, types out, goes see-through, fades ---- */
.code{left:420px;top:150px;width:440px;height:220px;border-radius:10px;background:rgba(28,27,30,calc(1 - .6 * clamp(0, calc((var(--q) - 5.72) / .12), 1)));
  color:var(--site-paper);padding:0 0 12px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5);
  --in:clamp(0, calc((var(--q) - 5) / .1), 1);
  opacity:calc(var(--in) * (1 - clamp(0, calc((var(--q) - 5.84) / .12), 1)));transform:translateY(calc((1 - var(--in)) * 20px))}
.code__bar{position:relative!important;margin:0 0 10px;height:30px;display:flex;align-items:center;gap:6px;padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.08);font:10px/1 var(--pb-mono);color:rgba(205,201,195,.55)}
.code__bar b{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.18)}
.code__bar b:nth-child(3){margin-right:8px}
.code__ln{position:relative!important;margin:0;display:flex;gap:16px;padding:0 16px;font:13px/26px var(--pb-mono);white-space:pre}
.code__ln > span{color:rgba(205,201,195,.35);width:10px;text-align:right}
.code .u{color:var(--pb-red)}
.code .i{color:#e9b46a}
.code .q{color:#9fc79a}

/* ---- 8. your turn ---- */
.ge3 .btn1{clip-path:none}
.at7 .btn1{pointer-events:auto;box-shadow:0 16px 40px -14px rgba(40,39,42,.55)}
.at7 .btn1:hover{--hov:1.05}
/* the arrow turns from ↗ to → on hover, like every CTA on the site */
.lns-pb__stage .btn1 .go svg{transition:transform .35s var(--e)}
.at7 .btn1:is(:hover,:focus-visible) .go svg,.lns-pb.is-static .btn1:is(:hover,:focus-visible) .go svg{transform:rotate(45deg)}
.btn1:focus-visible{outline:2px solid var(--pb-red);outline-offset:4px}
.aim{left:40px;top:370px;width:170px;height:52px;transform:translate(315px,-126px) scale(var(--end))}
.aim .ah{left:-120px;right:-120px;height:1px;background:rgba(237,29,4,.6);transform:scaleX(var(--e3))}
.aim .av{top:-90px;bottom:-90px;width:1px;background:rgba(237,29,4,.6);transform:scaleY(var(--e3))}
.aim em{left:0;top:74px;white-space:nowrap;font:8px/1 var(--pb-mono);color:var(--pb-red);opacity:var(--e3)}
.note{left:176px;top:-34px;width:150px;height:40px;color:var(--pb-red)}
.note svg{position:absolute;left:0;top:6px;width:26px;height:22px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--e4))}
/* the note "writes itself": revealed left to right */
.note span{position:absolute;left:28px;top:-6px;white-space:nowrap;font:500 17px/1 var(--pb-hand);transform:rotate(-6deg);
  clip-path:inset(-10px calc((1 - clamp(0, calc((var(--e4) - .25) / .75), 1)) * 100%) -10px -4px)}

/* ---- captions + skip ---- */
.lns-pb__caps{position:absolute;left:clamp(16px,4vw,56px);bottom:clamp(24px,5vh,48px);width:min(480px,calc(100% - 200px));height:130px;z-index:3}
.lns-pb__cap{position:absolute;left:0;bottom:0;width:100%;opacity:0;filter:blur(6px);transform:translateY(10px);
  transition:opacity .45s var(--e),filter .45s var(--e),transform .45s var(--e)}
.lns-pb__cap.is-on{opacity:1;filter:none;transform:none}
.lns-pb__count{display:flex;align-items:center;gap:8px;margin:0 0 8px;font:12px/1 var(--lns-display, system-ui, sans-serif);color:var(--pb-muted)}
.lns-pb__count span{color:var(--pb-red)}
.lns-pb__count i{width:22px;height:1px;background:currentColor}
.lns-pb__cap h3{margin:0 0 6px;font-family:var(--lns-display);font-size:clamp(26px,3vw,38px);line-height:1.05}
.lns-pb__cap p:last-child{margin:0;font-size:15px;line-height:1.55;color:var(--pb-muted)}
.lns-pb__skip{position:absolute;right:clamp(16px,4vw,56px);bottom:clamp(24px,5vh,48px);z-index:3;display:inline-flex;align-items:center;gap:8px;
  font:500 13px/1 var(--lns-body, system-ui, sans-serif);color:var(--pb-ink);background:transparent;border:1px solid var(--pb-line);border-radius:999px;padding:10px 14px;cursor:pointer;
  transition:background .25s,color .25s,opacity .3s}
.lns-pb__skip svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lns-pb__skip:hover{background:var(--pb-ink);color:var(--pb-paper)}
.lns-pb__pin.at7 .lns-pb__skip{opacity:0;pointer-events:none}

@media (max-width:720px){
  .lns-pb__caps{width:calc(100% - 32px);bottom:84px;height:120px}
  .lns-pb__cap p:last-child{font-size:14px}
  .lns-pb__skip{left:16px;right:auto;bottom:28px}
  .lns-pb__intro{font-size:14px;max-width:180px}
  .note{left:30px;top:-50px}
}

/* ---- tabs: which build the scroll plays ---- */
.lns-pb__tabs{position:absolute;left:50%;top:clamp(24px,5vh,48px);transform:translateX(-50%);z-index:4;display:flex;gap:2px;padding:4px;
  border:1px solid var(--pb-line);border-radius:999px;background:color-mix(in srgb, var(--pb-paper) 70%, transparent);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.lns-pb__tabs button{appearance:none;-webkit-appearance:none;border:0;margin:0;background:transparent;font:500 13px/1 var(--lns-body, system-ui, sans-serif);color:var(--pb-muted);
  padding:9px 16px;border-radius:999px;cursor:pointer;transition:background .25s,color .25s}
.lns-pb__tabs button:hover{color:var(--pb-ink)}
.lns-pb__tabs button[aria-selected="true"]{background:var(--pb-ink);color:var(--pb-paper)}
.lns-pb__tabs button:focus-visible{outline:2px solid var(--pb-red);outline-offset:2px}

/* the chosen build fades in when the tab changes */
@keyframes lnsPbIn{from{opacity:0}}
.scene{inset:0;animation:lnsPbIn .35s var(--e)}
.lns-pb__stage .red-on,.lns-pb__stage .lg-period{position:static}
.lns-pb__stage p{margin:0}
.lb{font:10px/1 var(--pb-mono);color:var(--pb-red);white-space:nowrap;opacity:0;transition:opacity .4s}

/* logo and flyer end on the button alone, on a light card */
.btn1.solo{--fill:1;display:flex;align-items:center;border:1px solid;opacity:var(--e1);clip-path:none}
.endcard{left:339px;top:228px;width:202px;height:84px;border-radius:34px;background:var(--site-paper);
  opacity:calc(var(--e1) * var(--pb-keepcard));transform:scale(calc(1 + var(--e2) * (var(--end) - 1)))}

/* ================= REAL WORK (website + system endings) ================= */
.shot{overflow:hidden;clip-path:inset(0 0 calc((1 - var(--k)) * 100%) 0);opacity:calc(1 - var(--e1))}
.shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 0}
.web-shot{left:0;top:34px;width:880px;height:506px;border-radius:0 0 14px 14px}
.sy-shot{left:80px;top:40px;width:720px;height:460px;border-radius:12px;z-index:4}
/* the demo button hides under the real site, then comes back for "Your turn." */
.has-shot .btn1:not(.solo){opacity:min(1, calc(min(1, var(--k) * 4) * (1 - clamp(0, calc((var(--q) - 6.48) / .07), 1)) + var(--e1) * 4))}
/* with the real system there, it stays put and the phone isn't needed */
.has-shot .sy-app{transform:none}
.has-shot .sy-phone{display:none}
/* once the screenshot covers it, the demo underneath is put away, so nothing ghosts through when it fades */
.has-shot.shot-in.is-web .scene > :not(.web-shot):not(.frame),.has-shot.shot-in .sy-app > :not(.sy-shot){visibility:hidden}

/* ================= LOGO ================= */
/* in "Variations" the whole drawing shrinks to the left so the variations fit beside it */
.lg-art{inset:0;--v:clamp(0, calc((var(--q) - 6) / .25), 1);transform-origin:440px 240px;
  transform:translate(calc(var(--v) * -215px), calc(var(--v) * 15px)) scale(calc(1 - .3 * var(--v)));opacity:calc(1 - var(--e1))}
/* 2. sketches: drawn by the pointer, then put away */
.lg-thumb{background:var(--site-paper);border-color:rgba(40,39,42,.3);
  opacity:calc(min(1, var(--k) * 4) * (1 - clamp(0, calc((var(--q) - 2) / .15), 1)))}
.lg-thumb svg{position:absolute;inset:0;width:100%;height:100%}
.lg-thumb path{fill:none;stroke:var(--site-ink);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k))}
.lg-ov,.lg-grid,.lg-mark{inset:0;width:100%;height:100%;overflow:visible}
.lg-mark svg{overflow:visible}
.lg-pick{fill:none;stroke:var(--pb-red);stroke-width:2.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k));
  opacity:calc(1 - clamp(0, calc((var(--q) - 2) / .15), 1))}
/* 3. artboard, grid, centre lines, round ends */
.lg-board{background:var(--site-paper);border-color:rgba(40,39,42,.3);border-radius:10px}
.lg-grid{opacity:calc(clamp(0, calc((var(--q) - 2.15) / .1), 1) * (1 - clamp(0, calc((var(--q) - 3.6) / .3), 1)))}
.lg-grid line{stroke:rgba(237,29,4,.2);stroke-width:1}
.lg-c{border:1px solid var(--pb-red);border-radius:50%;transform:scale(var(--k));
  opacity:calc(min(1, var(--k) * 3) * (1 - clamp(0, calc((var(--q) - 3.3) / .3), 1)))}
.lg-c em{left:32px;top:6px;font:10px/1 var(--pb-mono);color:var(--pb-red);white-space:nowrap}
/* the centre line: thin red while drawn, then it gains the mark's weight */
.lg-skel{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k));
  --g:clamp(0, calc((var(--q) - 3.35) / .22), 1);
  stroke:color-mix(in srgb, var(--site-ink) calc(var(--g) * 100%), var(--pb-red));
  stroke-width:calc(1.6px + var(--g) * 22.7px);
  opacity:calc(1 - clamp(0, calc((var(--q) - 3.6) / .08), 1))}
.lg-outline{fill:none;stroke:var(--site-ink);stroke-width:1.2;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k));
  opacity:calc(1 - clamp(0, calc((var(--q) - 3.7) / .2), 1))}
.lg-fill{--mf:clamp(0, calc((var(--q) - 5.34) / .1), 1);opacity:clamp(0, calc((var(--q) - 3.56) / .08), 1);
  fill:color-mix(in srgb, var(--logo-c) calc(var(--mf) * 100%), var(--site-ink))}
.lg-anc{width:9px;height:9px;margin:-4.5px 0 0 -4.5px;background:var(--site-paper);border:1.5px solid var(--pb-red);
  transform:scale(var(--k));opacity:calc(1 - clamp(0, calc((var(--q) - 3.9) / .2), 1))}
/* 5. wordmark */
.lg-word{left:0;right:0;top:376px;text-align:center;font:800 44px/1 var(--lns-display, system-ui, sans-serif);letter-spacing:-.02em;color:var(--site-ink);white-space:nowrap}
.lg-period{color:var(--logo-c);opacity:0;transition:opacity .5s}
.ge5 .lg-period{opacity:1}
.lg-track{left:0;right:0;top:428px;text-align:center}
.at4 .lg-track{opacity:1}
/* 7. variations slide in, the pointer checks each one */
.lg-tile{border-radius:14px;overflow:hidden;color:rgba(205,201,195,.7);
  opacity:calc(var(--k) * (1 - var(--e1)));
  transform:translate(calc(var(--vx, 0) * var(--e1) * 1px), calc((1 - var(--k)) * 24px + var(--vy, 0) * var(--e1) * 1px))}
.lg-tile svg{left:50%;top:44%;width:52%;height:52%;transform:translate(-50%,-50%)}
.lg-tile small{left:12px;bottom:10px;font:10px/1 var(--pb-mono);white-space:nowrap}
.lg-dark{background:var(--site-ink);box-shadow:inset 0 0 0 1px rgba(205,201,195,.14)}
.lg-red{background:var(--logo-c);color:rgba(40,39,42,.75)}
.lg-fav,.lg-card{background:var(--site-paper);border:1px solid rgba(40,39,42,.2);color:var(--site-muted)}
.lg-fav svg{width:34px;height:38px}
.lg-card svg{left:18px;top:50%;width:62px;height:68px;transform:translateY(-50%)}
.lg-card b{left:92px;top:38px;font:800 22px/1 var(--lns-display, system-ui, sans-serif);color:var(--site-ink);letter-spacing:-.01em}
.lg-card .red-on{color:var(--logo-c)}
.lg-card small{left:92px;top:68px;bottom:auto}
.lg-export{left:560px;top:414px;height:36px;padding:0 16px;display:flex;align-items:center;border-radius:999px;white-space:nowrap;
  background:var(--pb-ink);color:var(--pb-paper);font:600 12px/1 var(--lns-body, system-ui, sans-serif);
  opacity:calc(var(--k) * (1 - var(--e1)));
  transform:translate(calc(var(--vx, 0) * var(--e1) * 1px), calc((1 - var(--k)) * 12px + var(--vy, 0) * var(--e1) * 1px))}

/* ================= FLYER ================= */
/* 7. "Out in the world": the page tilts and gets pinned up */
.fl-group{inset:0;--r:clamp(0, calc((var(--q) - 6.15) / .3), 1);transform-origin:440px 0;
  transform:rotate(calc(var(--r) * -3deg)) scale(calc(1 - .08 * var(--r)));opacity:calc(1 - var(--e1))}
.fl-sheet{background:var(--site-paper);border-color:rgba(40,39,42,.3);border-radius:2px;overflow:hidden;
  box-shadow:0 calc(var(--r) * 30px) calc(var(--r) * 60px) calc(var(--r) * -20px) rgba(0,0,0,.5)}
.ge2 .fl-sheet{clip-path:none}
.fl-sky{inset:0;background:linear-gradient(#1f8fd1, #5fb4e2 55%, #f2c46b);clip-path:inset(0 0 calc((1 - var(--k)) * 100%) 0)}
/* 2. bleed, safe area, crop marks: gone once it's printed */
.fl-bleed,.fl-safe,.fl-crops{opacity:calc(min(1, var(--k) * 4) * (1 - clamp(0, calc((var(--q) - 6) / .15), 1)))}
.fl-bleed{border:1px dashed var(--pb-red);border-radius:0}
.fl-safe{border:1px dashed rgba(40,39,42,.4);border-radius:0}
.fl-crops{inset:0;width:100%;height:100%;overflow:visible}
.fl-crops path{fill:none;stroke:var(--pb-ink);stroke-width:1}
.fl-lb{color:var(--pb-ink);transition:none;
  opacity:calc(clamp(0, calc((var(--q) - var(--lb-a, 1.25)) / .1), 1) * (1 - clamp(0, calc((var(--q) - 6) / .15), 1)))}
.fl-lb.is-red{color:var(--pb-red);--lb-a:1.42}
.fl-lb.is-muted{color:var(--pb-muted);--lb-a:1.6}
.fl-lb.fl-cmyk{--lb-a:5.6}
/* 3. the photo's place */
.fl-img{border-radius:2px;border-style:dashed;opacity:calc(min(1, var(--k) * 4) * (1 - clamp(0, calc((var(--q) - 4.5) / .2), 1)))}
.fl-cap{left:8px;top:8px;font:10px/1 var(--pb-mono);color:var(--site-muted)}
/* 4-5. the type: heavy italic capitals; ink while drafting, then sun yellow and white */
.fl-built{inset:0}
.fl-t{color:var(--site-ink);overflow:visible;
  --fy:clamp(0, calc((var(--q) - 4.34) / .1), 1);--fw:clamp(0, calc((var(--q) - 4.6) / .25), 1)}
.fl-t .t{position:absolute;left:0;top:0;white-space:nowrap;font-family:var(--pb-poster);font-style:italic;font-weight:800;text-transform:uppercase;letter-spacing:-.01em}
.fl-y{color:color-mix(in srgb, #ffd21f calc(var(--fy) * 100%), var(--site-ink))}
.fl-w{color:color-mix(in srgb, #fff calc(var(--fw) * 100%), var(--site-ink))}
.fl-h1 .t{font-size:104px;line-height:71px;top:1px}
.fl-h2 .t{font-size:37px;line-height:27px}
.fl-h3 .t{font-size:128px;line-height:88px;left:4px;top:2px}
.fl-h3{--mx:calc(-60px * (1 - clamp(0, calc((var(--q) - 2.8) / .1), 1)))}
.fl-side .t{font-size:11.5px;line-height:13.5px;top:2px}
.fl-mini .t{font:600 6px/22px var(--lns-body, system-ui, sans-serif);text-transform:none;font-style:normal;left:6px}
.fl-summer .t{font-size:52px;line-height:38px;left:2px}
.fl-tags .t{font-size:14.4px;line-height:16px;font-weight:600;font-style:normal;letter-spacing:0}
.ge4 .fl-t{border-color:transparent}
.fl-swoosh{inset:0;width:100%;height:100%;overflow:visible}
.fl-swoosh path{fill:none;stroke:color-mix(in srgb, #fff calc(clamp(0, calc((var(--q) - 4.6) / .25), 1) * 100%), var(--site-ink));
  stroke-width:2.4;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k))}
/* 6. the finished flyer pulls down over the drawing; once it's there, the built type underneath bows out */
.fl-photo{left:238px;top:0;width:403px;height:540px;overflow:hidden;border-radius:2px;clip-path:inset(0 0 calc((1 - var(--k)) * 100%) 0)}
.fl-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.has-photo .fl-built{opacity:calc(1 - clamp(0, calc((var(--q) - 5.48) / .06), 1))}
.fl-export{width:200px;height:56px;border-radius:12px;background:var(--pb-ink);color:var(--pb-paper);
  opacity:calc(var(--k) * (1 - clamp(0, calc((var(--q) - 6.05) / .15), 1)));transform:translateY(calc((1 - var(--k)) * 12px))}
.fl-export span{left:14px;top:12px;font:600 12px/1 var(--lns-body, system-ui, sans-serif);white-space:nowrap}
.fl-export i{left:14px;right:14px;bottom:13px;height:3px;border-radius:2px;background:var(--pb-red);transform-origin:0 50%;
  transform:scaleX(clamp(0, calc((var(--q) - 5.68) / .25), 1))}
.fl-export small{right:14px;top:12px;font:10px/1 var(--pb-mono);color:var(--pb-red);opacity:clamp(0, calc((var(--q) - 5.92) / .05), 1)}
.fl-pin{left:432px;top:-6px;width:16px;height:16px;border-radius:50%;background:var(--pb-red);box-shadow:0 5px 8px -3px rgba(0,0,0,.55);
  transform:scale(clamp(0, calc((var(--q) - 6.55) / .07), 1));opacity:calc(1 - var(--e1))}

/* ================= SYSTEM ================= */
/* 2. the map fades away once the screens begin */
.sy-map{inset:0;opacity:calc(1 - clamp(0, calc((var(--q) - 2) / .15), 1))}
.sy-ent{background:var(--site-paper);align-items:flex-start;border-radius:10px}
.sy-ent .t{position:absolute;left:14px;top:12px;right:14px;display:flex;flex-direction:column;gap:9px}
.sy-ent b{font:700 15px/1 var(--lns-display, system-ui, sans-serif);padding-bottom:8px;border-bottom:1px solid rgba(40,39,42,.2)}
.sy-field{font:11px/1 var(--pb-mono);color:var(--site-muted)}
.sy-links{inset:0;width:100%;height:100%;overflow:visible}
.sy-links path{fill:none;stroke:var(--pb-red);stroke-width:1.5;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k))}
.sy-lb{opacity:clamp(0, calc((var(--q) - 1.9) / .08), 1);transition:none}
/* 3-7. the app; in "Live." it steps back to make room for the phone */
.sy-app{inset:0;--lv:clamp(0, calc((var(--q) - 6.05) / .25), 1);transform-origin:440px 270px;
  transform:translateX(calc(var(--lv) * -80px)) scale(calc(1 - .16 * var(--lv)));opacity:calc(1 - var(--e1))}
.sy-frame{background:var(--site-paper);border-radius:12px;box-shadow:0 calc(var(--lv) * 30px) 60px -30px rgba(0,0,0,calc(var(--lv) * .5))}
.ge3 .sy-frame{clip-path:none}
.sy-app .box{color:var(--site-ink)}
.sy-side{border-radius:12px 0 0 12px;align-items:flex-start}
.sy-side .t{position:absolute;left:14px;top:18px;right:10px;display:flex;flex-direction:column;gap:6px}
.sy-brand{font:800 18px/1 var(--lns-display, system-ui, sans-serif);margin:0 0 22px 4px}
.sy-brand .red-on{opacity:0;transition:opacity .5s}
.ge4 .sy-brand .red-on{opacity:1}
.sy-nav{display:block;padding:8px 10px;border-radius:8px;font:500 13px/1 var(--lns-body, system-ui, sans-serif);color:var(--site-muted)}
.sy-nav.is-on{--f:clamp(0, calc((var(--q) - 4.62) / .06), 1);
  background:color-mix(in srgb, var(--site-ink) calc(var(--f) * 100%), transparent);
  color:color-mix(in srgb, var(--site-paper) calc(var(--f) * 100%), var(--site-ink))}
.sy-top{align-items:center}
.sy-top .t{position:absolute;left:18px;top:17px;font:600 15px/1 var(--lns-body, system-ui, sans-serif)}
.sy-app .sy-btn{border-radius:999px;justify-content:center;font:600 12px/1 var(--lns-body, system-ui, sans-serif);
  --f:clamp(0, calc((var(--q) - 4.5) / .06), 1);
  background:color-mix(in srgb, var(--site-ink) calc(var(--f) * 100%), transparent);
  color:color-mix(in srgb, var(--site-paper) calc(var(--f) * 100%), var(--site-ink))}
.sy-stat{border-radius:10px;align-items:flex-start}
.sy-stat .t{position:absolute;left:14px;top:12px;display:flex;flex-direction:column;gap:8px}
.sy-stat small{font:11px/1 var(--pb-mono);color:var(--site-muted)}
.sy-stat strong{font:700 30px/1 var(--lns-display, system-ui, sans-serif);font-variant-numeric:tabular-nums}
.sy-stat.is-alert strong{transition:color .5s}
.ge4 .sy-stat.is-alert strong{color:var(--pb-red)}
.sy-chart,.sy-table,.sy-flow{border-radius:10px;align-items:flex-start}
.sy-chart .t,.sy-table .t,.sy-flow .t{position:absolute;left:14px;top:14px;font:600 13px/1 var(--lns-body, system-ui, sans-serif)}
.sy-bar{width:20px;border-radius:4px 4px 0 0;transform-origin:50% 100%;transform:scaleY(var(--k));
  background:rgba(40,39,42,.22);opacity:calc(1 - var(--e1))}
.sy-bar.is-today{--rb:clamp(0, calc((var(--q) - 4.34) / .08), 1);background:color-mix(in srgb, var(--pb-red) calc(var(--rb) * 100%), rgba(40,39,42,.22))}
.sy-row{display:flex;align-items:center;gap:10px;width:220px;height:30px;font:12px/1 var(--lns-body, system-ui, sans-serif);color:var(--site-ink);
  border-bottom:1px solid rgba(40,39,42,.12)}
.lns-pb__stage .sy-row > span,.lns-pb__stage .sy-side .t > *,.lns-pb__stage .sy-stat .t > *,.lns-pb__stage .sy-ent .t > *,
.lns-pb__stage .sy-screen em,.lns-pb__stage .sy-brand .red-on{position:static}
.sy-row{opacity:calc(clamp(0, calc((var(--q) - 3.62) / .04), 1) * (1 - var(--e1)))}
.sy-time{font:11px/1 var(--pb-mono);color:var(--site-muted);width:36px}
.sy-name{flex:1;white-space:nowrap}
.sy-pill{padding:4px 7px;border-radius:999px;border:1px solid rgba(40,39,42,.35);font:10px/1 var(--pb-mono);white-space:nowrap}
.ge4 .sy-pill.is-pending{border-color:var(--pb-red);color:var(--pb-red)}
.sy-pill.is-new{background:var(--pb-red);border-color:var(--pb-red);color:#fff}
.sy-row.is-new{--n:clamp(0, calc((var(--q) - 5.72) / .08), 1);opacity:calc(var(--n) * (1 - var(--e1)));transform:translateY(calc((1 - var(--n)) * -8px))}
/* 6. automations */
.sy-flow{background:var(--site-paper);z-index:1;box-shadow:0 20px 40px -24px rgba(0,0,0,.5);
  opacity:calc(min(1, var(--k) * 4) * (1 - clamp(0, calc((var(--q) - 5.95) / .1), 1)))}
.sy-node{z-index:2;width:220px;height:40px;display:flex;align-items:center;gap:8px;padding:0 14px;border-radius:10px;border:1px solid rgba(40,39,42,.35);
  background:var(--site-paper);color:var(--site-ink);font:600 12px/1 var(--lns-body, system-ui, sans-serif);
  opacity:calc(var(--k) * (1 - clamp(0, calc((var(--q) - 5.95) / .1), 1)));transform:translateY(calc((1 - var(--k)) * 8px))}
.sy-node.is-send{--s:clamp(0, calc((var(--q) - 5.56) / .05), 1);
  background:color-mix(in srgb, var(--site-ink) calc(var(--s) * 100%), var(--site-paper));color:color-mix(in srgb, var(--site-paper) calc(var(--s) * 100%), var(--site-ink))}
.sy-wires{inset:0;width:100%;height:100%;overflow:visible;z-index:2;opacity:calc(1 - clamp(0, calc((var(--q) - 5.95) / .1), 1))}
.sy-wires path{fill:none;stroke:var(--pb-red);stroke-width:1.5;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--k))}
.sy-pulse{z-index:3;left:375px;top:284px;width:10px;height:10px;border-radius:50%;background:var(--pb-red);
  --p:clamp(0, calc((var(--q) - 5.42) / .14), 1);transform:translateY(calc(var(--p) * 118px));
  opacity:calc(clamp(0, calc((var(--q) - 5.42) / .02), 1) * (1 - clamp(0, calc((var(--q) - 5.56) / .03), 1)))}
.sy-toast{z-index:3;left:540px;top:452px;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;white-space:nowrap;
  background:var(--site-ink);color:var(--site-paper);font:500 11px/1 var(--lns-body, system-ui, sans-serif);box-shadow:0 14px 30px -12px rgba(0,0,0,.5);
  opacity:calc(var(--k) * (1 - clamp(0, calc((var(--q) - 6) / .1), 1)));transform:translateY(calc((1 - var(--k)) * 10px))}
.lns-pb__stage .sy-toast i{position:static;width:8px;height:8px;border-radius:50%;background:var(--pb-red)}
/* 7. the phone */
.sy-phone{left:680px;top:110px;width:160px;height:320px;border-radius:26px;background:var(--site-ink);padding:8px;
  box-shadow:0 30px 60px -24px rgba(0,0,0,.6);
  opacity:calc(var(--k) * (1 - var(--e1)));
  transform:translate(calc(var(--vx, 0) * var(--e1) * 1px), calc((1 - var(--k)) * 60px + var(--vy, 0) * var(--e1) * 1px))}
.sy-screen{inset:8px;border-radius:19px;background:var(--site-paper);color:var(--site-ink);padding:22px 14px;display:flex;flex-direction:column;gap:8px}
.lns-pb__stage .sy-screen > *{position:static}
.sy-screen small{font:10px/1 var(--pb-mono);color:var(--site-muted)}
.sy-screen b{font:700 18px/1.1 var(--lns-display, system-ui, sans-serif);margin-bottom:8px}
.sy-screen span{font:11px/1 var(--lns-body, system-ui, sans-serif);padding:8px 0;border-bottom:1px solid rgba(40,39,42,.12);white-space:nowrap}
.sy-screen em{font:10px/1 var(--pb-mono);color:var(--site-muted);margin-right:4px}
.sy-screen .is-new{color:var(--pb-red)}

/* ================= VIDEO ================= */
.vd-app{inset:0;--lv:clamp(0, calc((var(--q) - 6.3) / .12), 1);opacity:calc(1 - var(--lv));transform:scale(calc(1 - .06 * var(--lv)));transform-origin:440px 270px}
.vd-bin{background:var(--site-paper);border-radius:10px;align-items:flex-start}
.vd-bin .t{position:absolute;left:14px;top:12px;font:600 13px/1 var(--lns-body, system-ui, sans-serif)}
.vd-thumb{width:110px;height:62px;border-radius:5px;opacity:calc(var(--k) * (1 - var(--e1)));transform:scale(calc(.85 + .15 * var(--k)))}
.vd-thumb > svg{position:absolute;inset:0;width:100%;height:100%;border-radius:5px}
.vd-lab{left:0;top:66px;font:9px/1 var(--pb-mono);color:var(--site-muted);white-space:nowrap}
.vd-star{right:5px;top:5px;width:14px;height:14px;background:var(--pb-red);opacity:var(--k);transform:scale(calc(.4 + .6 * var(--k)));
  clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.vd-raw{filter:saturate(.12) contrast(.72) brightness(1.3)}
.ge4 .vd-thumb .vd-raw{filter:none;transition:filter .6s}
.vd-mon{background:#121215;border-color:#121215;border-radius:8px}
.vd-screen{left:330px;top:50px;width:500px;height:272px;border-radius:4px;overflow:hidden;opacity:calc(clamp(0, calc((var(--q) - 2.9) / .1), 1))}
.vd-pan{inset:0}
.vd-pan > svg{position:absolute;left:-6%;top:-6%;width:112%;height:112%;transform:translateX(calc(var(--q) * -5px))}
.vd-graded{inset:0;clip-path:inset(0 calc((1 - var(--k)) * 100%) 0 0)}
.vd-graded .vd-pan > svg{filter:contrast(1.08) saturate(1.15)}
.vd-split{left:calc(var(--k) * 100%);top:0;bottom:0;width:2px;margin-left:-1px;background:var(--pb-red);opacity:0}
.vd-ba{top:10px;font:10px/1 var(--pb-mono);color:#fff;padding:4px 6px;border-radius:4px;background:rgba(0,0,0,.45);opacity:0;transition:opacity .4s}
.vd-before{right:10px}.vd-after{left:10px}
.at4 .vd-split,.at4 .vd-ba{opacity:1}
.vd-title{left:0;right:0;top:112px;text-align:center;font:800 40px/1 var(--lns-display, system-ui, sans-serif);color:#fff;letter-spacing:.02em;
  text-shadow:0 2px 20px rgba(0,0,0,.4)}
.vd-title .red-on{color:var(--pb-red);opacity:clamp(0, calc((var(--q) - 5.64) / .03), 1)}
.vd-tc{left:10px;bottom:10px;font:10px/1 var(--pb-mono);color:rgba(255,255,255,.85)}
.vd-render{left:0;bottom:0;height:4px;width:100%;background:var(--pb-red);transform-origin:0 50%;transform:scaleX(clamp(0, calc((var(--q) - 6.08) / .2), 1))}
.vd-done{right:10px;bottom:12px;font:10px/1 var(--pb-mono);color:#fff;padding:4px 6px;border-radius:4px;background:var(--pb-red);
  opacity:clamp(0, calc((var(--q) - 6.28) / .03), 1)}
.vd-tl{background:var(--site-paper);border-radius:10px}
.vd-tracks{inset:0;opacity:clamp(0, calc((var(--q) - 2.3) / .06), 1)}
.vd-tick{top:356px;width:1px;height:6px;background:rgba(40,39,42,.35)}
.vd-trk{left:52px;font:10px/1 var(--pb-mono);color:var(--site-muted)}
.vd-clip{top:394px;height:40px;border-radius:5px;padding:6px 8px;font:9px/1 var(--pb-mono);color:#fff;overflow:hidden;
  background:linear-gradient(180deg,#3a3462,#1d2140);border:1px solid rgba(255,255,255,.18);
  opacity:clamp(0, calc(var(--k) * 4), 1);transform:scale(calc(1.06 - .06 * var(--k)))}
.vd-tail{--del:clamp(0, calc((var(--q) - 3.38) / .05), 1);opacity:calc(var(--k) * (1 - var(--del)))}
.ge3 .vd-tail{background:rgba(237,29,4,.55)}
.vd-cut{top:388px;width:2px;height:52px;margin-left:-1px;background:var(--pb-red);opacity:calc(var(--k) * (1 - clamp(0, calc((var(--q) - 3.4) / .05), 1)))}
.vd-after-cut{transform:translateX(calc(clamp(0, calc((var(--q) - 3.42) / .15), 1) * -60px))}
.vd-tclip{background:rgba(237,29,4,.14);border-color:var(--pb-red);border-radius:5px}
.vd-tclip .t{font:9px/1 var(--pb-mono);color:var(--pb-red);padding-left:8px}
.vd-wave{width:4px;border-radius:2px;background:#5b7f8f;transform:scaleY(var(--k))}
.vd-beat{top:352px;width:8px;height:8px;background:var(--pb-red);clip-path:polygon(0 0,100% 0,50% 100%);opacity:var(--k)}
.vd-music{left:660px;top:460px;font:9px/1 var(--pb-mono);color:var(--site-muted)}
.vd-head{top:352px;width:2px;height:148px;margin-left:-1px;background:var(--pb-red);
  left:calc(90px + clamp(0, calc((var(--q) - 3.05) / .9), 1) * 550px);opacity:clamp(0, calc((var(--q) - 3) / .05), 1)}
.vd-head::before{content:"";position:absolute;left:-5px;top:-2px;width:12px;height:10px;background:var(--pb-red);clip-path:polygon(0 0,100% 0,100% 60%,50% 100%,0 60%)}
.vd-export{border-radius:999px;justify-content:center;font:600 11px/1 var(--lns-body, system-ui, sans-serif)}
.ge6 .vd-export{background:var(--pb-red);border-color:var(--pb-red);color:#fff}
.vd-out{opacity:calc(var(--k) * (1 - var(--e1)));
  transform:translate(calc(var(--vx, 0) * var(--e1) * 1px), calc((1 - var(--k)) * 30px + var(--vy, 0) * var(--e1) * 1px))}
.ns-title{font-family:var(--lns-display, system-ui, sans-serif);letter-spacing:.02em}
.vd-out__in{inset:0;border-radius:8px;overflow:hidden;background:#000;box-shadow:0 24px 50px -24px rgba(0,0,0,.6)}
.vd-out__in > svg,.vd-out__in > video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vd-out__t{left:10px;right:10px;top:50%;transform:translateY(-50%);text-align:center;font-weight:800;line-height:1;color:#fff;
  font-family:var(--lns-display, system-ui, sans-serif);letter-spacing:.02em;text-shadow:0 2px 16px rgba(0,0,0,.45)}
.vd-out__t .red-on{color:var(--pb-red)}
.vd-fmt{left:0;top:calc(100% + 10px);white-space:nowrap;font:11px/1 var(--lns-body, system-ui, sans-serif);color:var(--pb-muted)}
.vd-fmt b{position:static;font:700 12px/1 var(--pb-mono);color:var(--pb-red);margin-right:6px}
.vd-play{left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.92);
  opacity:calc(1 - clamp(0, calc((var(--q) - 6.63) / .04), 1))}
.vd-play::after{content:"";position:absolute;left:18px;top:14px;border-left:14px solid var(--site-ink);border-top:9px solid transparent;border-bottom:9px solid transparent}
.vd-prog{left:0;bottom:0;height:3px;background:var(--pb-red);width:calc(clamp(0, calc((var(--q) - 6.63) / .4), 1) * 100%)}

@media (max-width:720px){
  .lns-pb__tabs{left:16px;top:96px;transform:none}
  .lns-pb__tabs{max-width:calc(100% - 32px);overflow-x:auto;scrollbar-width:none}
  .lns-pb__tabs button{padding:8px 12px;flex:none}
}

/* reduced motion: no pinning, the finished site plus every step as a list */
.lns-pb.is-static .lns-pb__pin{position:relative;height:auto;min-height:0;padding:140px 0 0}
.lns-pb.is-static .lns-pb__stagewrap{position:relative;height:620px}
.lns-pb.is-static .lns-pb__caps{position:relative;left:auto;bottom:auto;width:auto;height:auto;margin:0 clamp(16px,4vw,56px) 48px;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px}
.lns-pb.is-static .lns-pb__cap{position:relative;opacity:1;filter:none;transform:none}
.lns-pb.is-static .btn1{pointer-events:auto}
@media (prefers-reduced-motion:reduce){.lns-pb *{transition:none!important}}
`;
