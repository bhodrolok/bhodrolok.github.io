function enableThemeToggle() {
  const themeToggle = document.querySelector('#theme-toggle');
  if (!themeToggle) return;
  const hlLink = document.querySelector('link#hl');
  const preferDark = window.matchMedia("(prefers-color-scheme: dark)");
  function toggleTheme(theme) {
    if (theme == "dark") document.body.classList.add('dark'); else document.body.classList.remove('dark');
    if (hlLink) hlLink.href = `/giallo-${theme}.css`;
    sessionStorage.setItem("theme", theme);
    toggleGiscusTheme(theme);
  }
  function toggleGiscusTheme(theme) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: `${location.origin}/giscus_${theme}.css` } } }, 'https://giscus.app');
  }
  function initGiscusTheme(evt) {
    if (evt.origin !== 'https://giscus.app') return;
    if (!(typeof evt.data === 'object' && evt.data.giscus)) return;
    toggleGiscusTheme(sessionStorage.getItem("theme") || (preferDark.matches ? "dark" : "light"));
    window.removeEventListener('message', initGiscusTheme);
  }
  window.addEventListener('message', initGiscusTheme);
  themeToggle.addEventListener('click', () => toggleTheme(sessionStorage.getItem("theme") == "dark" ? "light" : "dark"));
  preferDark.addEventListener("change", e => toggleTheme(e.matches ? "dark" : "light"));
  if (!sessionStorage.getItem("theme") && preferDark.matches) toggleTheme("dark");
  if (sessionStorage.getItem("theme") == "dark") toggleTheme("dark");
}

function enablePrerender() {
  const prerender = (a) => {
    if (!a.classList.contains('instant')) return;
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({ prerender: [{ source: 'list', urls: [a.href] }] });
    document.body.append(script);
    a.classList.remove('instant');
  }
  const prefetch = (a) => {
    if (!a.classList.contains('instant')) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = a.href;
    document.head.append(link);
    a.classList.remove('instant');
  }
  const support = HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules');
  const handle = support ? prerender : prefetch;
  document.querySelectorAll('a.instant').forEach(a => {
    if (a.href.endsWith(window.location.pathname)) return;
    let timer;
    a.addEventListener('mouseenter', () => {
      timer = setTimeout(() => handle(a), 50);
    });
    a.addEventListener('mouseleave', () => clearTimeout(timer));
    a.addEventListener('touchstart', () => handle(a), { passive: true });
  });
}

function enableRssMask() {
  const rssBtn = document.querySelector('#rss-btn');
  const mask = document.querySelector('#rss-mask');
  const copyBtn = document.querySelector('#rss-mask button');
  if (!rssBtn || !mask) return;
  rssBtn.addEventListener('click', (e) => {
    e.preventDefault();
    mask.showModal();
  });
  const close = (e) => {
    if (e.target == mask) mask.close();
  };
  mask.addEventListener('click', close);
  const copy = () => {
    navigator.clipboard.writeText(copyBtn.dataset.link).then(() => {
      copyBtn.innerHTML = copyBtn.dataset.checkIcon;
      copyBtn.classList.add('copied');
      copyBtn.removeEventListener('click', copy);
      setTimeout(() => {
        mask.close();
        copyBtn.innerHTML = copyBtn.dataset.copyIcon;
        copyBtn.classList.remove('copied');
        copyBtn.addEventListener('click', copy);
      }, 400);
    });
  }
  copyBtn.addEventListener('click', copy);
}

function enableOutdateAlert() {
  const alert = document.querySelector('#outdate_alert');
  if (!alert) return;
  const publish = document.querySelector('#publish');
  const updated = document.querySelector('#updated');
  const updateDate = new Date(updated ? updated.textContent : publish.textContent);
  const intervalDays = Math.floor((Date.now() - updateDate.getTime()) / (24 * 60 * 60 * 1000));
  const alertDays = parseInt(alert.dataset.days);
  if (intervalDays >= alertDays) {
    const msg = alert.dataset.alertTextBefore + intervalDays + alert.dataset.alertTextAfter;
    alert.querySelector('.content').textContent = msg;
    alert.classList.remove('hidden');
  }
}

function enableTocTooltip() {
  const anchors = document.querySelectorAll('aside nav a');
  if (anchors.length == 0) return;
  const toggleTooltip = () => {
    anchors.forEach(anchor => {
      if (anchor.offsetWidth < anchor.scrollWidth) {
        anchor.setAttribute('title', anchor.textContent);
      } else {
        anchor.removeAttribute('title');
      }
    });
  };
  window.addEventListener('resize', toggleTooltip);
  toggleTooltip();
}

function addCopyBtns() {
  const cfg = document.querySelector('#copy-cfg');
  if (!cfg) return;
  const copyIcon = cfg.dataset.copyIcon;
  const checkIcon = cfg.dataset.checkIcon;
  document.querySelectorAll('pre').forEach(block => {
    if (block.classList.contains('mermaid')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'codeblock';
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.ariaLabel = 'copy';
    btn.innerHTML = copyIcon;
    const copy = () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        btn.innerHTML = checkIcon;
        btn.classList.add('copied');
        btn.removeEventListener('click', copy);
        setTimeout(() => {
          btn.innerHTML = copyIcon;
          btn.classList.remove('copied');
          btn.addEventListener('click', copy);
        }, 1500);
      });
    };
    btn.addEventListener('click', copy);
    wrapper.appendChild(block.cloneNode(true));
    wrapper.appendChild(btn);
    block.replaceWith(wrapper);
  });
}

function addBackToTopBtn() {
  const backBtn = document.querySelector('#back-to-top');
  if (!backBtn) return;
  const toTop = () => window.scrollTo({ top: 0 });
  const toggle = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 200 && !backBtn.classList.contains('shown')) {
      backBtn.classList.add('shown');
      backBtn.setAttribute('tabindex', 0);
      backBtn.addEventListener('click', toTop);
    } else if (scrollTop <= 200 && backBtn.classList.contains('shown')) {
      backBtn.classList.remove('shown');
      backBtn.setAttribute('tabindex', -1);
      backBtn.removeEventListener('click', toTop);
    }
  };
  window.addEventListener('scroll', toggle);
  toggle();
}

function addFootnoteBacklink() {
  const footnotes = document.querySelectorAll('.footnote-definition');
  footnotes.forEach(footnote => {
    const backlink = document.createElement('button');
    backlink.className = 'backlink';
    backlink.ariaLabel = 'backlink';
    backlink.innerHTML = '↩︎';
    backlink.addEventListener('click', () => window.scrollTo({
      top: document.querySelector(`.footnote-reference a[href="#${footnote.id}"]`).getBoundingClientRect().top + window.scrollY,
    }));
    const lastEl = footnote.lastElementChild || footnote;
    lastEl.appendChild(backlink);
  });
}

function enableImgLightense() {
  window.addEventListener("load", () => Lightense(".prose img:not(.no-lightense)", { background: 'rgba(43, 43, 43, 0.19)' }));
}

function enableReaction() {
  const container = document.querySelector('.reaction');
  if (!container) return;
  const endpoint = container.dataset.endpoint;
  const slug = location.pathname.split('/').filter(Boolean).pop();
  let state = { error: false, reaction: {} };
  const render = () => {
    const btns = Object.entries(state.reaction).map(([emoji, [count, reacted]])=> {
      const span = document.createElement('span');
      span.textContent = count;
      const btn = document.createElement('button');
      if (reacted) btn.classList.add('reacted');
      btn.append(emoji, span);
      btn.onclick = () => toggle(emoji);
      return btn;
    });
    if (state.error) {
      container.classList.add('error');
    } else {
      container.classList.remove('error');
    }
    container.replaceChildren(...btns);
  };
  const toggle = async (target) => {
    const [count, reacted] = state.reaction[target];
    state.reaction[target] = reacted ? [count - 1, false] : [count + 1, true];
    render();
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, target, reacted: !reacted }),
      });
      if (resp.status === 200) {
        error = false;
      } else {
        throw new Error();
      }
    } catch (err) {
      state.error = true;
      state.reaction[target] = [count, reacted];
      render();
    }
  };
  const init = async () => {
    const resp = await fetch(`${endpoint}?slug=${slug}`);
    if (resp.status === 200) {
      state.reaction = await resp.json();
      render();
    }
  };
  init();
}

function enableBackLink() {
  const backLink = document.querySelector('#back-link');
  if (!backLink) return;
  backLink.addEventListener('click', (e) => {
    if (document.referrer && location.href.startsWith(document.referrer) && !location.hash && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}


/**
 * Generates a day greeting based on the user's preferred language and the current day of the week.
 * Currently used in the footer of the webpage.
 * 
 * @return {void} 
 * @see generateRandGreetingAdjective
 */
function generateDayGreeting() {
  const date = new Date();
  // toLocaleString(locales, options): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
  // locales string obtained by navigator.language to get the (user) preferred language eg: 'en-US', 'de-DE'
  const options = {
    // Only concerned with the day for this one
    weekday: 'long'
  };
  const localDay = date.toLocaleDateString(navigator.language, options);
  const greeting = document.getElementById("greeting"); 
  const fmtGreeting = `Hope you are having ${generateRandGreetingAdjective()} <b>${localDay}</b>!`;
  if (greeting) {
    // Do this IFF an element with id 'greeting' exists in the page
    greeting.innerHTML = fmtGreeting;
  };
}

/**
 * Generate a greeting adjective by picking a random value from an array of synonyms for the word 'pleasant'.
 * Designed to be used in conjunction with the generateDayGreeting function.
 * 
 * @return {string} a adjective that is synonymous with 'pleasant'
 */
function generateRandGreetingAdjective(){
  // https://www.wordhippo.com/what-is/another-word-for/pleasant.html
  const synonyms = new Array(
    "delightful", "amiable", "fine", "gratifying", "refreshing", "lovely", "charming", "amazing", "blissful", "blessed", "splendid", "superb", "enjoyable", "great", "enchanting"
  );
  // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array#comment85738512_5915122
  const randomAdjective = synonyms[Math.floor(synonyms.length * Math.random() | 0 )];
  // Nuance for indefinite articles
  const vowelregex = /[aeiou]/; 
  const indefiniteArticle = vowelregex.test(randomAdjective[0]) ? 'an ' : 'a ';
  const fmtres = ` ${indefiniteArticle} ${randomAdjective} `;
  return fmtres;
}


async function updateCommitInfo() {
  // Good ref I think: https://stackoverflow.com/a/51417209 + https://docs.github.com/en/rest/commits/statuses?apiVersion=2022-11-28
  const apiURL = 'https://api.github.com/repos/bhodrolok/bhodrolok.github.io/commits/main';
  const gentime = document.getElementById('git-commit-info');

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    const result = await response.json();
    // first 7 digits = short SHA-1 = enough to identify, ref: https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection 
    const fmtcommitsha = result.sha.substring(0,7);
    // 'date' value is datestring in the ISO 8601 format (Z tz = UTC) i.e. "2011-10-05T14:48:00.000Z"
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
    // Create new UTC-formatted date object using this datestring as argument
    const dateoptions = {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#weekday
      //weekday: "long",
      day: "numeric", // '2-digit'
      month:"short",
      year: "numeric",
      // timeZoneName: "short",
    };
    const resdate = new Date(result.commit.author.date);
    const resdatelocalized = resdate.toLocaleDateString(navigator.language, dateoptions);
    // For the anchor tag link
    const commitghURL = `https://github.com/bhodrolok/bhodrolok.github.io/commit/${fmtcommitsha}`;
    // Put it all together for ez access & mods later
    const commitinfo = {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" height="12" width="15" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="currentColor" d="M320 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm156.8-48C462 361 397.4 416 320 416s-142-55-156.8-128H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H163.2C178 151 242.6 96 320 96s142 55 156.8 128H608c17.7 0 32 14.3 32 32s-14.3 32-32 32H476.8z"/></svg>`,
      shortsha1: `${fmtcommitsha}`,
      url: `${commitghURL}`,
      date: `${resdatelocalized}`
    };
    // Final formatted string to be displayed
    const fmtcommitinfo = `Rev: <a href="${commitinfo.url}" target="_blank">${commitinfo.shortsha1}</a> ${commitinfo.icon} ${commitinfo.date}`;

    if (gentime) {
      // Update HTML element
      gentime.innerHTML = fmtcommitinfo;
    }
  } catch (error) {
    console.log(error);
  }
}

function getPageSourceGH(){
  // (Base)Directory where the actual contents of the webpages are stored
  const ghContentBaseURL = 'https://github.com/Bhodrolok/Bhodrolok.github.io/tree/main/content';
  const sourceUpdateFooter = document.getElementById('page-source-gh');
  // flag for checking if the document body element has 'homepage' class
  const sourceIsHomepage = document.body.classList.contains('homepage');

  // Get the HTML filename, ref: https://stackoverflow.com/a/4758125 + https://stackoverflow.com/a/73187826
  // 1) current page URL --> separate into segmented elements of filepath (without backslash) 2) Get the last element i.e. filename
  // Looks like hosting a webpage on GitHub Pages adds a trailing slash to the end of the URL, like: github.io/about --> github.io/about/ src: https://stackoverflow.com/a/54791518
  const pageSourceURLPre = window.location.href;
  const lastCharRegEx = /.$/;
  // Remove the trailing slash (if it exists at end of URL) by replacing the character with a empty string
  const pagesourceURLPost = (pageSourceURLPre.charAt(pageSourceURLPre.length - 1) === '/') ? pageSourceURLPre.replace(lastCharRegEx, "") : pageSourceURLPre;
  const pageSourceURLSegments = pagesourceURLPost.split("/");        
  const pageSourceFileName = pageSourceURLSegments[pageSourceURLSegments.length - 1];
  // The 'filename' will also be the directory(ies) under the main 'contents' directory, each with their own indexes
  // Only exception being the homepage, the baseurl so to speak, so point it directly to 'content/_index.md' instead of 'content/{filename}/_index.md' 
  const ghDirectory = (sourceIsHomepage) ? `` : `/${pageSourceFileName}`;

  const pageSourceURL = `${ghContentBaseURL}${ghDirectory}/_index.md`;
  const viewIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="12" width="15" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="currentColor" d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/></svg>`
  const viewText = `view page source`;
  
  const fmtUpdate = `${viewIcon} <a href="${pageSourceURL}" target="_blank">${viewText}</a>`;
  if (sourceUpdateFooter){
    // Update the HTML element with correct page source hosted in GitHub
    sourceUpdateFooter.innerHTML = fmtUpdate;
  }
}

enableThemeToggle();
enablePrerender();
enableRssMask();
enableBackLink();
if (document.body.classList.contains('post')) {
  enableOutdateAlert();
  addBackToTopBtn();
  enableTocTooltip();
}
if (document.querySelector('.prose')) {
  addCopyBtns();
  addFootnoteBacklink();
  enableImgLightense();
  enableReaction();
}
generateDayGreeting();
updateCommitInfo();
getPageSourceGH();