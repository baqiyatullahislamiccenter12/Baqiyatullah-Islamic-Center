(() => {
  const contentUrl = "./content.json";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const localized = (value, lang) => {
    if (typeof value === "string") return value.trim();
    if (!value || typeof value !== "object" || Array.isArray(value)) return "";
    const selected = value[lang] || value.es || value.en || value.ur || "";
    return typeof selected === "string" ? selected.trim() : "";
  };
  const validIsoDate = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const todayInMalaga = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const part = type => parts.find(item => item.type === type)?.value;
    return part("year") + "-" + part("month") + "-" + part("day");
  };
  const renderCards = (items, list, empty, lang, type) => {
    if (!list || !empty) return;
    const today = todayInMalaga();
    const visibleItems = (Array.isArray(items) ? items : []).filter(item => {
      if (!item || typeof item !== "object" || !localized(item.title, lang)) return false;
      if (type === "events" && item.date) {
        if (!validIsoDate(item.date) || item.date < today) return false;
      }
      return true;
    });
    list.innerHTML = visibleItems.map(item => {
      const title = escapeHtml(localized(item.title, lang));
      const description = escapeHtml(localized(item.description, lang));
      const location = escapeHtml(localized(item.location, lang));
      let date = "";
      if (validIsoDate(item.date)) {
        const [year, month, day] = item.date.split("-").map(Number);
        const parsed = new Date(Date.UTC(year, month - 1, day, 12));
        date = escapeHtml(new Intl.DateTimeFormat(lang, {
          timeZone: "Europe/Madrid", day: "numeric", month: "long", year: "numeric"
        }).format(parsed));
      }
      const meta = [date, location].filter(Boolean).join(" · ");
      return '<article class="update-card">' +
        (meta ? '<p class="update-card-meta">' + meta + '</p>' : '') +
        '<h3>' + title + '</h3>' +
        (description ? '<p>' + description + '</p>' : '') +
        '</article>';
    }).join("");
    empty.hidden = visibleItems.length > 0;
  };
  const refresh = lang => {
    if (!window.baqiyatullahContent) return;
    renderCards(window.baqiyatullahContent.events, document.getElementById("eventsList"), document.getElementById("eventsEmpty"), lang, "events");
    renderCards(window.baqiyatullahContent.announcements, document.getElementById("announcementsList"), document.getElementById("announcementsEmpty"), lang, "announcements");
  };
  window.updateEventsLanguage = refresh;
  fetch(contentUrl, { headers: { Accept: "application/json" } })
    .then(response => {
      if (!response.ok) throw new Error("Content request failed: " + response.status);
      return response.json();
    })
    .then(content => {
      if (!content || typeof content !== "object" || Array.isArray(content)) throw new Error("Content JSON has an invalid format");
      window.baqiyatullahContent = content;
      refresh(document.documentElement.lang || "es");
    })
    .catch(error => console.error("Events and announcements could not be loaded; showing empty states.", error));
})();