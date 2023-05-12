const toggleBtn = document.querySelector('#color-toggle');
const toggleBtnIcon = document.querySelector('#color-toggle > i');
// Media queries
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");
const prefersCoffee = window.matchMedia("(prefers-color-scheme: coffee");       // Not really an 'option' as system themes are either light or dark

// Switch current theme to dark mode
function toggleDarkTheme() {
    toggleBtnIcon.classList.remove('ri-moon-line', 'ri-cup-fill');
    toggleBtnIcon.classList.add('ri-sun-line');
    document.body.classList.add('dark-mode');
    document.body.classList.remove('coffee-mode', 'light-mode');
    currentTheme = "dark";
    localStorage.setItem("theme", "dark");
}

// Switch current theme to light mode
function toggleLightTheme() {
    toggleBtnIcon.classList.remove('ri-sun-line', 'ri-cup-fill');
    toggleBtnIcon.classList.add('ri-moon-line');
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode', 'coffee-mode');
    currentTheme = "light";
    localStorage.setItem("theme", "light");
}

// Switch current theme to coffee mode
function toggleCoffeeTheme() {
    toggleBtnIcon.classList.remove('ri-sun-line', 'ri-moon-line');
    toggleBtnIcon.classList.add('ri-cup-fill');
    document.body.classList.add('coffee-mode');
    document.body.classList.remove('dark-mode','light-mode');
    currentTheme = "coffee";
    localStorage.setItem("theme", "coffee");
}

// Determine current theme mode of page 
let currentTheme = localStorage.getItem("theme");

if (currentTheme == "dark") {
    toggleDarkTheme();
} else if (currentTheme == "light") {
    toggleLightTheme();
} else if (currentTheme == "coffee") {
    toggleCoffeeTheme();
}
else if (currentTheme == null) {
    // Check end-user's preferred color scheme ( through user agent or OS setting)
    if (prefersDark.matches) {
        toggleDarkTheme();
        currentTheme = "dark";
        localStorage.setItem("theme", "dark");
    } else if (prefersCoffee.matches){
        toggleCoffeeTheme();
        currentTheme = "coffee";
        localStorage.setItem("theme", "coffee");
    }
    else {
        currentTheme = "light";
        localStorage.setItem("theme", "light");
    }
};

// Use icon to toggle between the different themes
// Order of switching: Light --> Dark --> Coffee --> Light (repeat)
toggleBtn.addEventListener('click', e => {
    e.preventDefault();
    if (currentTheme == "light") {
        toggleDarkTheme();
    } else if (currentTheme == "dark"){
        toggleCoffeeTheme();
    }
    else {
        toggleLightTheme();
    }
});

// Automatically switch to user preferred theme (if set)
prefersDark.addEventListener("change", e => {
    if (e.matches) toggleDarkTheme();
});

prefersLight.addEventListener("change", e => {
    if (e.matches) toggleLightTheme();
});

prefersCoffee.addEventListener("change", e => {
    if (e.matches) toggleCoffeeTheme();
});