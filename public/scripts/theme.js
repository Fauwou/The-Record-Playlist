export function timeForThemes()
{
    const themeState = { currentTheme: "auto"}
    const themeToggle = document.querySelector(".theme-toggle")
    const themeText = themeToggle.querySelector(".theme-text")
    const icon = themeToggle.querySelector("i")


    if (!themeToggle) return

    function togglingThemes()
    {
        if (themeState.currentTheme === "auto") {
            themeState.currentTheme = "light"
        } else if (themeState.currentTheme === "light") {
            themeState.currentTheme = "dark"
        } else {
            themeState.currentTheme = "auto"
        }

        applyingTheThemes()
        localStorage.setItem("themePreference", themeState.currentTheme)
    }

    function applyingTheThemes()
    {
        document.documentElement.classList.remove("theme-light", "theme-dark")
        if (themeState.currentTheme !== "auto") {
            document.documentElement.classList.add(`theme-${themeState.currentTheme}`)
        }
        UPDATINGTHEMES()
    }

    function UPDATINGTHEMES()
    {
        if (themeState.currentTheme === "light") {
            icon.className = "fa fa-sun-o"
            themeText.textContent = "Light"
        } else if (themeState.currentTheme === "dark") {
            icon.className = "fa fa-moon-o"
            themeText.textContent = "Dark"
        } else {
            icon.className = "fa fa-adjust"
            themeText.textContent = "Auto"
        }
    }

    function loadingThemes()
    {
        const savedTheme = localStorage.getItem("themePreference")
        themeState.currentTheme = savedTheme || "auto"
        applyingTheThemes()
    }

    themeToggle.addEventListener("click", togglingThemes)
    loadingThemes()
}