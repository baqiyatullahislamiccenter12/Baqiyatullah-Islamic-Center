(() => {
  const city = { latitude: 36.7213, longitude: -4.4214, timezone: "Europe/Madrid" };
  const labels = {
    es: { Fajr:"Fajr", Sunrise:"Salida del sol", Dhuhr:"Dhuhr", Asr:"Asr", Maghrib:"Maghrib", Isha:"Isha" },
    en: { Fajr:"Fajr", Sunrise:"Sunrise", Dhuhr:"Dhuhr", Asr:"Asr", Maghrib:"Maghrib", Isha:"Isha" },
    ur: { Fajr:"فجر", Sunrise:"طلوعِ آفتاب", Dhuhr:"ظہر", Asr:"عصر", Maghrib:"مغرب", Isha:"عشاء" }
  };
  const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const grid = document.getElementById("prayerGrid");
  const dateEl = document.getElementById("prayerDate");
  const errorEl = document.getElementById("prayerError");
  if (!grid || !dateEl || !errorEl) return;

  let loadedTimings = null;
  const renderPrayerTimes = lang => {
    const currentLang = labels[lang] ? lang : "es";
    const now = new Date();
    dateEl.textContent = new Intl.DateTimeFormat(currentLang, {
      timeZone: city.timezone, weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(now);
    if (!loadedTimings) return;
    grid.innerHTML = order.map(name => {
      const raw = loadedTimings[name];
      if (!raw) throw new Error("Missing " + name);
      const time = raw.match(/\d{1,2}:\d{2}/)?.[0];
      if (!time) throw new Error("Invalid " + name);
      return '<article class="prayer-card"><span>' + labels[currentLang][name] + '</span><strong>' + time + '</strong></article>';
    }).join("");
  };

  window.updatePrayerTimesLanguage = lang => {
    try { renderPrayerTimes(lang); }
    catch (error) { console.error("Could not update prayer-time language:", error); }
  };

  renderPrayerTimes(document.documentElement.lang || "es");
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: city.timezone, day: "2-digit", month: "2-digit", year: "numeric"
  }).formatToParts(new Date());
  const part = type => dateParts.find(item => item.type === type)?.value;
  const apiDate = part("day") + "-" + part("month") + "-" + part("year");
  const url = new URL("https://api.aladhan.com/v1/timings/" + apiDate);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("method", "0");
  url.searchParams.set("timezonestring", city.timezone);

  fetch(url.toString(), { headers: { Accept: "application/json" } })
    .then(response => {
      if (!response.ok) throw new Error("Prayer API returned " + response.status);
      return response.json();
    })
    .then(payload => {
      if (payload.code !== 200 || !payload.data?.timings) throw new Error("Prayer API returned no timings");
      loadedTimings = payload.data.timings;
      renderPrayerTimes(document.documentElement.lang || "es");
      errorEl.hidden = true;
    })
    .catch(error => {
      console.error("Prayer times unavailable:", error);
      errorEl.hidden = false;
      renderPrayerTimes(document.documentElement.lang || "es");
    });
})();
