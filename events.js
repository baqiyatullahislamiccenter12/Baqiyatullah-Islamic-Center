(() => {
  const contentUrl = "./content.json";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const localized = (value, lang) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[lang] || value.es || value.en || value.ur || "";
  };
  const renderCards = (items, list, empty, lang, type) => {
    if (!list || !empty) return;
    const todayParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(new Date());
    const todayPart = type => todayParts.find(part => part.type === type)?.value;
    const today = todayPart("year") + "-" + todayPart("month") + "-" + todayPart("day");
    const visibleItems = (Array.isArray(items) ? items : []).filter(item => {
      if (!item || !item.title) return false;
      if (type === "events" && item.date && item.date < today) return false;
      return true;
    });
    list.innerHTML = visibleItems.map(item => {
      const title = escapeHtml(localized(item.title, lang));
      const description = escapeHtml(localized(item.description, lang));
      const location = escapeHtml(localized(item.location, lang));
      let date = "";
      if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        const parsed = new Date(item.date + "T12:00:00");
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
    .then(response => { if (!response.ok) throw new Error("Content request failed: " + response.status); return response.json(); })
    .then(content => {
      window.baqiyatullahContent = content;
      refresh(document.documentElement.lang || "es");
    })
    .catch(error => console.error("Events and announcements could not be loaded; showing empty states.", error));
})();
