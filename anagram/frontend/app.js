(function () {
  const API_PATH = "/api/anagrams";

  const input = document.getElementById("anagramInput");
  const btn = document.getElementById("generateButton");
  const modeBtn = document.getElementById("modeToggle");
  const wordList = document.getElementById("wordResults");
  const phraseList = document.getElementById("phraseResults");
  const hint = document.getElementById("resultHint");
  const track = document.querySelector(".run-track");
  const duck = document.querySelector(".run-track__duck");
  if (!input || !btn || !modeBtn || !wordList || !phraseList || !hint || !track) return;

  const meta = document.querySelector('meta[name="anagram-api-base"]');
  const apiBase = (meta?.getAttribute("content") || "").trim().replace(/\/$/, "");
  let controller = null;
  let mode = "osrs";

  document.body.classList.add("osrs");

  function normalize(s) { return s.toLowerCase().replace(/[^a-z]/g, ""); }

  function renderList(ul, items) {
    ul.innerHTML = "";
    if (!items.length) {
      ul.classList.add("empty");
      const li = document.createElement("li");
      li.textContent = "Nothing here yet.";
      ul.appendChild(li);
      return;
    }
    ul.classList.remove("empty");
    for (const text of items) {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    }
  }

  function startRun() {
    track.classList.remove("running");
    void track.offsetWidth;
    track.classList.add("running");
    var fill = track.querySelector(".run-track__fill");
    return new Promise(function (resolve) {
      var done = function () {
        track.classList.remove("running");
        resolve();
      };
      if (fill) {
        fill.addEventListener("animationend", done, { once: true });
      } else {
        setTimeout(done, 1500);
      }
    });
  }

  modeBtn.addEventListener("click", () => {
    mode = mode === "osrs" ? "general" : "osrs";
    document.body.classList.toggle("osrs");
    modeBtn.textContent = mode === "osrs" ? "OSRS Mode" : "General Mode";
  });

  async function generate() {
    const raw = input.value.trim();

    if (!raw) {
      hint.textContent = "Please enter a word or phrase.";
      renderList(wordList, []);
      renderList(phraseList, []);
      return;
    }

    if (controller) controller.abort();
    controller = new AbortController();
    btn.disabled = true;
    hint.textContent = "Searching...";

    const norm = normalize(raw);
    const url = apiBase ? apiBase + API_PATH : API_PATH;

    const runDone = startRun();
    const fetchDone = fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: raw, dict: mode, max_words: 24, max_phrases: 24, max_phrase_terms: 3 }),
      signal: controller.signal,
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });

    try {
      const [, data] = await Promise.all([runDone, fetchDone]);
      const words = (data.word_matches ?? []).filter(w => normalize(w) !== norm);
      const phrases = (data.phrase_matches ?? []).filter(p => normalize(p) !== norm);
      const n = words.length + phrases.length;

      hint.textContent = n ? `Found ${n} match${n > 1 ? "es" : ""}.` : "No anagrams found.";
      renderList(wordList, words);
      renderList(phraseList, phrases);
    } catch (err) {
      if (err.name === "AbortError") return;
      hint.textContent = "Could not reach the API — is the backend running?";
      renderList(wordList, []);
      renderList(phraseList, []);
    } finally {
      btn.disabled = false;
      controller = null;
    }
  }

  btn.addEventListener("click", generate);
  input.addEventListener("keydown", e => { if (e.key === "Enter") generate(); });

  renderList(wordList, []);
  renderList(phraseList, []);
  hint.textContent = "Ready — type something and hit Generate.";
})();
