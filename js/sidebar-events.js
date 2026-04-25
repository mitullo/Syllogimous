// js/sidebar-events.js
// FIXED - All settings sections now open/close correctly

function openSettingsSection(sectionId) {
    console.log('Opening section:', sectionId);   // for debugging

    // In flat mode, no navigation needed
    const sidebar = document.getElementById('sidebar-settings');
    if (sidebar && sidebar.classList.contains('flat-settings')) return;

    const isNavBar = sidebar && sidebar.classList.contains('section-nav-bar');

    // Hide main menu (unless nav bar mode)
    const mainMenu = document.querySelector('.settings-main-menu');
    if (mainMenu && !isNavBar) mainMenu.classList.add('hidden');

    // Show back button (unless nav bar mode)
    const backBtn = document.getElementById('settings-back-btn');
    if (backBtn && !isNavBar) backBtn.classList.add('visible');

    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });

    // Highlight active nav button
    if (isNavBar) {
        document.querySelectorAll('.settings-menu-btn').forEach(btn => {
            btn.removeAttribute('data-active');
        });
        const activeBtn = document.querySelector(`.settings-menu-btn[data-section="${sectionId}"]`);
        if (activeBtn) activeBtn.setAttribute('data-active', '');
    }

    // Show the one we want
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        // Ensure content and header are not collapsed
        const content = section.querySelector('.settings-section-content');
        const header = section.querySelector('.settings-section-header');
        if (content) {
            content.classList.remove('collapsed');
        }
        if (header) {
            header.classList.remove('collapsed');
        }
    } else {
        console.error(`Section #${sectionId} not found in HTML!`);
    }
}

function closeSettingsSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.classList.remove('active');

    const sidebar = document.getElementById('sidebar-settings');
    const isNavBar = sidebar && sidebar.classList.contains('section-nav-bar');

    if (!isNavBar) {
        const mainMenu = document.querySelector('.settings-main-menu');
        if (mainMenu) mainMenu.classList.remove('hidden');

        // Hide back button
        const backBtn = document.getElementById('settings-back-btn');
        if (backBtn) backBtn.classList.remove('visible');
    }

    // Clear active nav highlight
    document.querySelectorAll('.settings-menu-btn').forEach(btn => {
        btn.removeAttribute('data-active');
    });
}

function goBackToSettingsMenu() {
    const sidebar = document.getElementById('sidebar-settings');
    const isNavBar = sidebar && sidebar.classList.contains('section-nav-bar');

    // In nav bar mode, just deactivate all sections
    if (isNavBar) {
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.settings-menu-btn').forEach(btn => {
            btn.removeAttribute('data-active');
        });
        return;
    }

    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show main menu
    const mainMenu = document.querySelector('.settings-main-menu');
    if (mainMenu) mainMenu.classList.remove('hidden');

    // Hide back button
    const backBtn = document.getElementById('settings-back-btn');
    if (backBtn) backBtn.classList.remove('visible');
}

// When opening settings, ensure we start at the main menu
document.addEventListener('DOMContentLoaded', () => {
    const settingsLabel = document.querySelector('label.open[for="offcanvas-settings"]');
    if (settingsLabel) {
        settingsLabel.addEventListener('click', () => {
            // Reset to main menu view
            document.querySelectorAll('.settings-section').forEach(section => {
                section.classList.remove('active');
            });
            const mainMenu = document.querySelector('.settings-main-menu');
            if (mainMenu) mainMenu.classList.remove('hidden');
            const backBtn = document.getElementById('settings-back-btn');
            if (backBtn) backBtn.classList.remove('visible');
            document.querySelectorAll('.settings-menu-btn').forEach(btn => {
                btn.removeAttribute('data-active');
            });
        });
    }
});

// Click outside to close sidebars (your original code, improved)
const sylSettingsCheckbox = document.getElementById('offcanvas-settings');
const sylSettingsSidebar = document.getElementById('sidebar-settings');
const sylHistoryCheckbox = document.getElementById('offcanvas-history');
const sylHistorySidebar = document.getElementById('sidebar-history');
const sylCreditsCheckbox = document.getElementById('offcanvas-credits');
const sylCreditsSidebar = document.getElementById('sidebar-credits');

document.addEventListener('click', (event) => {
    // Don't close sidebars if explanation popup exists
    const explanationPopup = document.querySelector('.explanation-popup');
    if (explanationPopup && sylHistoryCheckbox.checked) return;

    if (sylSettingsCheckbox && sylSettingsSidebar &&
        !sylSettingsSidebar.contains(event.target) && event.target !== sylSettingsCheckbox) {
        sylSettingsCheckbox.checked = false;
    }
    if (sylHistoryCheckbox && sylHistorySidebar &&
        !sylHistorySidebar.contains(event.target) && event.target !== sylHistoryCheckbox) {
        sylHistoryCheckbox.checked = false;
    }
    if (sylCreditsCheckbox && sylCreditsSidebar &&
        !sylCreditsSidebar.contains(event.target) && event.target !== sylCreditsCheckbox) {
        sylCreditsCheckbox.checked = false;
    }
});