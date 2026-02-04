// NOTE: Used AI and Google to help write the code in this file.
function parseDateFromDataset(article) {
  const raw = article.dataset.date || "";
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

function getNum(el, key) {
  const v = Number(el.dataset[key]);
  return Number.isFinite(v) ? v : Infinity;
}

function syncControlsFromURL() {
  const params = new URLSearchParams(window.location.search);

  const grade = params.get("grade") || "all";
  const sort = params.get("sort") || "date_desc";

  const gradeRadio = document.querySelector(`input[name="grade"][value="${grade}"]`);
  if (gradeRadio) gradeRadio.checked = true;

  const sortSelect = document.getElementById("sort");
  if (sortSelect) sortSelect.value = sort;

  return { grade, sort };
}

function applyGradeAndSort(grade, sort) {
  const container = document.getElementById("race-cards");
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('article[aria-label="Race card"]'));

  cards.forEach(card => {
    const cardGrade = card.dataset.grade;
    const shouldShow = (grade === "all") || (cardGrade === grade);
    card.style.display = shouldShow ? "" : "none";
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

function updateURL(grade, sort) {
  const url = new URL(window.location.href);
  url.searchParams.set("grade", grade);
  url.searchParams.set("sort", sort);
  history.replaceState({}, "", url);
}

document.addEventListener("DOMContentLoaded", () => {
  const { grade, sort } = syncControlsFromURL();
  applyGradeAndSort(grade, sort);

  const form = document.getElementById("filters");
  if (!form) return;

  form.addEventListener("change", () => {
    const selectedGrade =
      document.querySelector('input[name="grade"]:checked')?.value || "all";
    const selectedSort = document.getElementById("sort")?.value || "date_desc";

    updateURL(selectedGrade, selectedSort);
    applyGradeAndSort(selectedGrade, selectedSort);
  });

  form.addEventListener("submit", (e) => e.preventDefault());
});
