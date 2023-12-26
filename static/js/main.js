function enableThemeToggle() {
  const themeToggle = document.querySelector('#theme-toggle');
  const hlLink = document.querySelector('link#hl');
  const preferDark = window.matchMedia("(prefers-color-scheme: dark)");
  const preferLight = window.matchMedia( "(prefers-color-scheme: light)" );
  
  function toggleTheme(theme) {
    // ...<-- Dark --> Cyberpunk --> Coffee --> Cyberspace --> Light -->...
    switch (theme){
      case "dark":
        document.body.classList.add('dark'); 
        document.body.classList.remove('coffee', 'light', 'cyberpunk', 'cyberspace');
        themeToggle.innerHTML = themeToggle.dataset.robotIcon; 
        break;
      case "cyberpunk":
        document.body.classList.add('cyberpunk');
        document.body.classList.remove('dark', 'light', 'coffee', 'cyberspace');
        themeToggle.innerHTML = themeToggle.dataset.cupIcon;
        break;
      case "cyberspace":
        document.body.classList.add('cyberspace');
        document.body.classList.remove('dark', 'light', 'coffee', 'cyberpunk');
        themeToggle.innerHTML = themeToggle.dataset.sunIcon;
        break;
      case "coffee":
        document.body.classList.add('coffee');
        document.body.classList.remove('dark', 'light', 'cyberpunk', 'cyberspace');
        themeToggle.innerHTML = themeToggle.dataset.bikeIcon;
        break;
      case "light":
        document.body.classList.add('light');
        document.body.classList.remove('dark', 'coffee', 'cyberpunk', 'cyberspace');
        themeToggle.innerHTML = themeToggle.dataset.moonIcon;
        break;
    };

    if (hlLink) hlLink.href = `/hl-${theme}.css`;
    
    localStorage.setItem("theme", theme);
    toggleGiscusTheme(theme);
  }
  
  function toggleGiscusTheme(theme) {
    // https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#parent-to-giscus-message-events
    const iframe = document.querySelector('iframe.giscus-frame');
    var giscusTheme, giscusURL;
    switch(theme){
      case "dark":
        giscusTheme = "dark_dimmed";
        giscusURL = "https://giscus.app/themes";
        break;
      case "cyberpunk":
        giscusTheme = "transparent_dark";
        giscusURL = "https://giscus.app/themes";
        break;
      case "coffee":
        giscusTheme = `giscus_${theme}`;
        giscusURL = location.origin;
        break;
      case "cyberspace":
        giscusTheme = "cobalt";
        giscusURL = "https://giscus.app/themes";
        break;
      case "light":
        giscusTheme = `giscus_${theme}`;
        giscusURL = location.origin;
        break;
    }
    var giscusThemeSetter = `${giscusURL}/${giscusTheme}.css`
    console.log(`giscusTheme: ${giscusTheme}\ngiscusURL: ${giscusURL}\ngiscusThemeSetter: ${giscusThemeSetter}`);
    if (iframe) iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusThemeSetter } } }, 'https://giscus.app');
  }

  function initGiscusTheme() {
    toggleGiscusTheme(localStorage.getItem("theme") || (preferDark.matches ? "dark" : "light"));
    window.removeEventListener('message', initGiscusTheme);
  }
  
  window.addEventListener('message', initGiscusTheme);
  
  // Order should be: ...<-- Dark --> Cyberpunk --> Coffee --> Cyberspace --> Light -->...
  themeToggle.addEventListener('click', e =>  {
    var currentTheme = localStorage.getItem("theme");
    e.preventDefault();
    switch (currentTheme) {
      case "light":
        toggleTheme("dark");
        break;
      case "dark":
        toggleTheme("cyberpunk");
        break;
      case "cyberpunk":
        toggleTheme("coffee");
        break;
      case "coffee":
        toggleTheme("cyberspace");
        break;
      case "cyberspace":
        toggleTheme("light");
        break;
    }
  });
  
  preferDark.addEventListener("change", e => { 
    toggleTheme(e.matches ? "dark" : "cyberpunk") 
  });

  // User loading site for first time, enable their preferred color theme (light or dark)
  if (!localStorage.getItem("theme")) {
    if (preferDark.matches) { 
      toggleTheme("dark");
    } else if (preferLight.matches) {
      toggleTheme("light");
    } else {
      // Not sure if this even runs, surely its always either light or dark, no?
      toggleTheme("coffee");
    }
  }

  switch (localStorage.getItem("theme")){
    case "dark":
      toggleTheme("dark");
      break;
    case "cyberpunk":
      toggleTheme("cyberpunk");
      break;
    case "coffee":
      toggleTheme("coffee");
      break;
    case "cyberspace":
      toggleTheme("cyberspace");
      break;
    case "light":
      toggleTheme("light");
      break;
  }
}

function enableNavFold() {
  const nav = document.querySelector('header nav');
  if (!nav) return;
  const toggler = nav.querySelector('#toggler');
  if (!toggler) return;
  const foldItems = nav.querySelectorAll('.fold');
  toggler.addEventListener('click', () => {
    if (window.innerWidth < 768 && [...foldItems].every(item => !item.classList.contains('shown'))) return;
    foldItems.forEach(item => item.classList.toggle('shown'));
  });  
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

function enableTocToggle() {
  const tocToggle = document.querySelector('#toc-toggle');
  if (!tocToggle) return;
  const aside = document.querySelector('aside');
  tocToggle.addEventListener('click', () => {
    tocToggle.classList.toggle('active');
    aside.classList.toggle('shown');
  });
}

function enableTocIndicate() {
  const toc = document.querySelector('aside nav');
  if (!toc) return;
  const headers = document.querySelectorAll('h2, h3');
  const tocMap = new Map();
  headers.forEach(header => tocMap.set(header, toc.querySelector(`a[href="#${header.id}"]`)));
  let actived = null;
  const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = tocMap.get(entry.target);
      if (target == actived) return;
      if (actived) actived.classList.remove('active');
      target.classList.add('active');
      actived = target;
    }
  }), { rootMargin: '-9% 0px -90% 0px' });
  headers.forEach(header => observer.observe(header));
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
        }, 2000);
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
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const toggle = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 200 && !backBtn.classList.contains('shown')) {
      backBtn.classList.add('shown');
      backBtn.addEventListener('click', toTop);
    } else if (scrollTop <= 200 && backBtn.classList.contains('shown')) {
      backBtn.classList.remove('shown');
      backBtn.removeEventListener('click', toTop);
    }
  };
  window.addEventListener('scroll', toggle);
  toggle();
}

function addFootnoteBacklink() {
  const backlinkIcon = document.querySelector('.prose').dataset.backlinkIcon;
  const footnotes = document.querySelectorAll('.footnote-definition');
  footnotes.forEach(footnote => {
    const backlink = document.createElement('button');
    backlink.className = 'backlink';
    backlink.ariaLabel = 'backlink';
    backlink.innerHTML = backlinkIcon;
    backlink.addEventListener('click', () => window.scrollTo({
      top: document.querySelector(`.footnote-reference a[href="#${footnote.id}"]`).getBoundingClientRect().top + window.scrollY - 50,
    }));
    footnote.appendChild(backlink);
  });
}

function enableImgLightense() {
  // https://sparanoid.com/work/lightense-images/
  window.addEventListener("load", () => Lightense(".prose img", { background: 'rgba(43, 43, 43, 0.19)' }));
}

// For greeting message in footer
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
    // Do this iff an element with id 'greeting' exists in the page
    greeting.innerHTML = fmtGreeting;
  };
}

// For above function, throw random synonym for the adjective 'pleasant' which I think goes well with the greeting
function generateRandGreetingAdjective(){
  // https://www.wordhippo.com/what-is/another-word-for/pleasant.html
  const synonyms = new Array(
    "delightful", "amiable", "fine", "gratifying", "refreshing", "lovely", "charming", "amazing", "blissful", "blessed", "splendid", "superb", "enjoyable", "great", "enchanting"
  );
  // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array#comment85738512_5915122
  const randadjective = synonyms[Math.floor(synonyms.length * Math.random() | 0 )];
  // Indefinite articles nuance...
  const vowelregex = /[aeiou]/; 
  const a_or_an = vowelregex.test(randadjective[0]) ? 'an ' : 'a ';
  const fmtres = ` ${a_or_an} ${randadjective} `;
  return fmtres;
}

function showBuildSpecs(){
  const specsElement = document.getElementById("build-specs");
  const fmtSpecs = `Built with
  <a href="https://www.getzola.org" target="_blank" rel='noreferrer noopener'>zola</a>
  & 
  <a href="https://github.com/isunjn/serene" target="_blank" rel='noreferrer noopener'>serene</a>
  with tweaks.`
  if (specsElement){
    specsElement.innerHTML = fmtSpecs;
  }
}

async function updateCommitInfo() {
  // Good ref I think: https://stackoverflow.com/a/51417209 + https://docs.github.com/en/rest/commits/statuses?apiVersion=2022-11-28
  const apiURL = 'https://api.github.com/repos/bhodrolok/bhodrolok.github.io/commits/main';
  const gentime = document.getElementById('build-time');

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

function enableAudio(){
  // Good ref I think: https://dobrian.github.io/cmp/topics/sample-recording-and-playback-with-web-audio-api/1.loading-and-playing-sound-files.html
  const audioElement = document.getElementById('audio-1');
  var audioSrc = `audio/music.mp3`;
  
  const audio = new Audio(audioSrc);
  const audioIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15 4.58152V12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C12.3506 9 12.6872 9.06016 13 9.17071V2.04938C18.0533 2.5511 22 6.81465 22 12C22 17.5229 17.5228 22 12 22C6.47715 22 2 17.5229 2 12C2 6.81465 5.94668 2.5511 11 2.04938V4.0619C7.05369 4.55399 4 7.92038 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 8.64262 17.9318 5.76829 15 4.58152Z"></path></svg>`
  const fmtAudio = ` ${audioIconSVG}`;
  const eventType = [ "canplay", "canplaythrough" ];
  
  if (audioElement){
    audioElement.innerHTML = fmtAudio; 
    //audio.loop = true;
    // audio.play();
    audio.addEventListener(eventType[0], () => {
      audio.play();
    });
  }
}

//--------------------------------------------

enableThemeToggle();
enableNavFold();
if (document.body.classList.contains('post')) {
  enableOutdateAlert();
  enableTocToggle();
  enableTocIndicate();
  addBackToTopBtn();
}
if (document.querySelector('.prose')) {
  addCopyBtns();
  addFootnoteBacklink();
  enableImgLightense();
}

showBuildSpecs();
generateDayGreeting();
updateCommitInfo();
getPageSourceGH();
//enableAudio();