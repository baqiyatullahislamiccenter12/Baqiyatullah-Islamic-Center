(() => {
  const city = { latitude: 36.7213, longitude: -4.4214, timezone: "Europe/Madrid" };
  const labels = {
    es: { Fajr:"Fajr", Sunrise:"Salida del sol", Dhuhr:"Dhuhr", Asr:"Asr", Maghrib:"Maghrib", Isha:"Isha" },
    en: { Fajr:"Fajr", Sunrise:"Sunrise", Dhuhr:"Dhuhr", Asr:"Asr", Maghrib:"Maghrib", Isha:"Isha" },
    ur: { Fajr:"فجر", Sunrise:"طلوعِ آفتاب", Dhuhr:"ظہر", Asr:"عصر", Maghrib:"مغرب", Isha:"عشاء" }
  };
  const retryLabels = { es:"Reintentar horarios", en:"Retry prayer times", ur:"اوقات دوبارہ لوڈ کریں" };
  const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const grid = document.getElementById("prayerGrid");
  const dateEl = document.getElementById("prayerDate");
  const errorEl = document.getElementById("prayerError");
  if (!grid || !dateEl || !errorEl) return;

  let loadedTimings = null;
  let loadedDateKey = "";
  let requestInProgress = false;
  let retryButton = document.getElementById("prayerRetry");
  if (!retryButton) {
    retryButton = document.createElement("button");
    retryButton.id = "prayerRetry";
    retryButton.className = "prayer-retry";
    retryButton.type = "button";
    retryButton.hidden = true;
    errorEl.insertAdjacentElement("afterend", retryButton);
  }
  retryButton.addEventListener("click", () => loadPrayerTimes(true));

  function getMálagaDate() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: city.timezone, day: "2-digit", month: "2-digit", year: "numeric"
    }).formatToParts(new Date());
    const part = type => parts.find(item => item.type === type)?.value;
    return {
      key: part("year") + "-" + part("month") + "-" + part("day"),
      apiDate: part("day") + "-" + part("month") + "-" + part("year")
    };
  }

  function renderPrayerTimes(lang) {
    const currentLang = labels[lang] ? lang : "es";
    dateEl.textContent = new Intl.DateTimeFormat(currentLang, {
      timeZone: city.timezone, weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(new Date());
    if (!loadedTimings) {
      grid.innerHTML = order.map(name =>
        '<article class="prayer-card"><span>' + labels[currentLang][name] + '</span><strong>—:—</strong></article>'
      ).join("");
      return;
    }
    grid.innerHTML = order.map(name => {
      const raw = loadedTimings[name];
      const time = typeof raw === "string" ? raw.match(/\d{1,2}:\d{2}/)?.[0] : null;
      if (!time) throw new Error("Invalid or missing prayer time: " + name);
      return '<article class="prayer-card"><span>' + labels[currentLang][name] + '</span><strong>' + time + '</strong></article>';
    }).join("");
  }

  function updateLanguage(lang) {
    const currentLang = labels[lang] ? lang : "es";
    retryButton.textContent = retryLabels[currentLang];
    try { renderPrayerTimes(currentLang); }
    catch (error) {
      console.error("Could not render prayer times:", error);
      loadedTimings = null;
      renderPrayerTimes(currentLang);
      errorEl.hidden = false;
      retryButton.hidden = false;
    }
  }
  window.updatePrayerTimesLanguage = updateLanguage;

  async function loadPrayerTimes(force = false) {
    const date = getMálagaDate();
    if (requestInProgress) return;
    if (!force && loadedDateKey === date.key && loadedTimings) return;
    requestInProgress = true;
    retryButton.disabled = true;
    const lang = document.documentElement.lang || "es";
    try {
      const url = new URL("https://api.aladhan.com/v1/timings/" + date.apiDate);
      url.searchParams.set("latitude", String(city.latitude));
      url.searchParams.set("longitude", String(city.longitude));
      url.searchParams.set("method", "0");
      url.searchParams.set("timezonestring", city.timezone);
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Prayer API returned " + response.status);
      const payload = await response.json();
      if (payload.code !== 200 || !payload.data?.timings) throw new Error("Prayer API returned no timings");
      const timings = payload.data.timings;
      order.forEach(name => {
        if (typeof timings[name] !== "string" || !/\d{1,2}:\d{2}/.test(timings[name])) {
          throw new Error("Prayer API returned an invalid time for " + name);
        }
      });
      loadedTimings = timings;
      loadedDateKey = date.key;
      errorEl.hidden = true;
      retryButton.hidden = true;
      renderPrayerTimes(lang);
    } catch (error) {
      console.error("Prayer times unavailable:", error);
      if (loadedDateKey !== date.key) loadedTimings = null;
      errorEl.hidden = false;
      retryButton.hidden = false;
      renderPrayerTimes(lang);
    } finally {
      requestInProgress = false;
      retryButton.disabled = false;
    }
  }

  renderPrayerTimes(document.documentElement.lang || "es");
  loadPrayerTimes();
  function refreshIfDateChanged() {
    const currentDate = getMálagaDate().key;
    if (currentDate !== loadedDateKey) loadPrayerTimes();
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshIfDateChanged();
  });
  window.addEventListener("focus", refreshIfDateChanged);
  window.setInterval(refreshIfDateChanged, 60 * 1000);
})();