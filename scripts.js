// NOTE: Used AI and Google to help write the code in this file.

// Theme management
// Apply OS preference on page load
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  html.classList.add('dark');
} else if (savedTheme === 'light') {
  html.classList.add('light');
} else if (savedTheme === 'high-contrast') {
  html.classList.add('high-contrast');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  html.classList.add('dark');
}

// Toggle between dark and light mode
const darkToggle = document.getElementById('dark-mode-toggle');
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light', 'high-contrast');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Toggle high contrast mode
const contrastToggle = document.getElementById('contrast-toggle');
if (contrastToggle) {
  contrastToggle.addEventListener('click', () => {
    if (html.classList.contains('high-contrast')) {
      html.classList.remove('high-contrast');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('dark', 'light');
      html.classList.add('high-contrast');
      localStorage.setItem('theme', 'high-contrast');
    }
  });
}

// Navigation
// Hamburger menu toggle for mobile
const toggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Floating action button
// Show the button after scrolling, clicking the button scrolls to the filters section
const JumptoFilters = document.getElementById('JumptoFilters');
if (JumptoFilters) {
  window.addEventListener('scroll', () => {
    JumptoFilters.classList.toggle('visible', window.scrollY > 300);
  });

  JumptoFilters.addEventListener('click', () => {
    const filters = document.getElementById('filters');
    const header = document.querySelector('header');
    if (filters) {
      const headerHeight = header ? header.offsetHeight : 0;
      const top = filters.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
}

// helpers
// Parse a race card's date from its data-date attribute
function parseDateFromDataset(article) {
  const raw = article.dataset.date || "";
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

// Read a numeric data attribute; returns Infinity if missing or invalid
function getNum(el, key) {
  const v = Number(el.dataset[key]);
  return Number.isFinite(v) ? v : Infinity;
}

// Filter logic
// Read grade and sort from URL params.
function syncControlsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const grade = params.get("grade") || "all";
  const sort = params.get("sort") || "date_desc";
  const gradeSelect = document.getElementById("grade");
  if (gradeSelect) gradeSelect.value = grade;
  const sortSelect = document.getElementById("sort");
  if (sortSelect) sortSelect.value = sort;
  return { grade, sort };
}

// Show or hide and reorder race cards.
function applyGradeAndSort(grade, sort) {
  const container = document.getElementById("race-cards");
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('article[aria-label="Race card"]'));

  cards.forEach(card => {
    const cardGrade = card.dataset.grade;
    const shouldShow = (grade === "all") || (cardGrade === grade);
    if (shouldShow) {
      card.style.display = "";
      card.classList.remove('fade-in');
      void card.offsetWidth;
      card.classList.add('fade-in');
      card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
    } else {
      card.style.display = "none";
    }
  });

  let compareFn = null;
  if (sort === "time_asc") {
    compareFn = (a, b) => getNum(a, "timeSeconds") - getNum(b, "timeSeconds");
  } else if (sort === "time_desc") {
    compareFn = (a, b) => getNum(b, "timeSeconds") - getNum(a, "timeSeconds");
  } else if (sort === "place_asc") {
    compareFn = (a, b) => getNum(a, "place") - getNum(b, "place");
  } else if (sort === "place_desc") {
    compareFn = (a, b) => getNum(b, "place") - getNum(a, "place");
  } else if (sort === "date_asc") {
    compareFn = (a, b) => parseDateFromDataset(a) - parseDateFromDataset(b);
  } else if (sort === "date_desc") {
    compareFn = (a, b) => parseDateFromDataset(b) - parseDateFromDataset(a);
  }

  if (compareFn) {
    cards.sort(compareFn);
    cards.forEach(card => container.appendChild(card));
  }
}

// Update the URL query string with the current grade and sort values
function updateURL(grade, sort) {
  const url = new URL(window.location.href);
  url.searchParams.set("grade", grade);
  url.searchParams.set("sort", sort);
  history.replaceState({}, "", url);
}

// Init
// Set up filters and drop down
document.addEventListener("DOMContentLoaded", () => {
  const { grade, sort } = syncControlsFromURL();
  applyGradeAndSort(grade, sort);

  const form = document.getElementById("filters");
  if (!form) return;

  form.addEventListener("change", () => {
    const selectedGrade = document.getElementById("grade")?.value || "all";
    const selectedSort = document.getElementById("sort")?.value || "date_desc";
    updateURL(selectedGrade, selectedSort);
    applyGradeAndSort(selectedGrade, selectedSort);
  });

  form.addEventListener("submit", (e) => e.preventDefault());
});
