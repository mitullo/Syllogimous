const profileInput = document.getElementById('profile-input');
const profileArrow = document.getElementById('profile-arrow');
const profileList = document.getElementById('profile-list');
const profileDropdown = document.querySelector('.profile-dropdown');
const profilePlus = document.getElementById('profile-plus');
const profileExport = document.getElementById('profile-export');
const profileImport = document.getElementById('profile-import');
const profileCopied = document.getElementById('profile-copied');

const PROFILE_CAPSULE_PREFIX = 'SYL3:';
const MAX_PROFILE_SHARE_URL_LENGTH = 1800;

class ProfileStore {
    constructor() {
        this.profiles = [];
        this.selectedProfile = 0;
        this.settingsMigration = new SettingsMigration();
    }

    startup() {
        this.loadProfiles();
        this.loadIncomingProfile();
    }

    overrideExistingKeys(target, source) {
        for (const key of Object.keys(target)) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    loadProfiles() {
        const oldMigratedSettings = getLocalStorageObj(oldSettingsKey);

        const storedProfiles = getLocalStorageObj(profilesKey);
        if (storedProfiles && Array.isArray(storedProfiles) && storedProfiles.length > 0) {
            this.profiles = storedProfiles;
        } else {
            let starterSettings = structuredClone(defaultSavedata);
            if (oldMigratedSettings) {
                this.overrideExistingKeys(starterSettings, oldMigratedSettings);
                // Backwards compatibility: don't blow away everyone's history
                for (const movedKey of ["score", "questions", "backgroundImage", "gameAreaColor"]) {
                    if (oldMigratedSettings.hasOwnProperty(movedKey)) {
                        appState[movedKey] = oldMigratedSettings[movedKey];
                    }
                }
            }
            let defaultProfiles = [{
                name: "Default",
                id: '12345678',
                savedata: starterSettings,
            }];
            this.profiles = defaultProfiles;
        }

        if (oldMigratedSettings) {
            localStorage.removeItem(oldSettingsKey);
        }

        let profileIndex = 0
        const storedSelection = +localStorage.getItem(selectedProfileKey);
        if (0 <= storedSelection && storedSelection < this.profiles.length) {
            profileIndex = storedSelection;
        }

        this.selectProfile(profileIndex);
    }

    saveProfiles() {
        setLocalStorageObj(profilesKey, this.profiles);
        setLocalStorageObj(selectedProfileKey, this.selectedProfile);
    }

    syncProfileChange() {
        for (const profile of this.profiles) {
            this.uncompressSavedata(profile.savedata);
            this.settingsMigration.update(profile.savedata);
        }
        this.saveProfiles();
        savedata = this.current().savedata;
    }

    handleProfileChange() {
        this.syncProfileChange();
        populateSettings();
        init();
    }

    current() {
        return this.profiles[this.selectedProfile];
    }

    selectProfile(index) {
        this.selectedProfile = index;
        profileList.style.display = 'none';
        this.handleProfileChange();
        this.renderDropdown();
    }

    deleteProfile(index) {
        this.profiles.splice(index, 1);
        if (this.selectedProfile >= this.profiles.length) {
            this.selectedProfile = 0;
        }
        this.handleProfileChange();
        this.renderDropdown();
    }

    copySelectedProfile() {
        const curr = this.current();
        const newProfile = {
            savedata: structuredClone(curr.savedata),
            name: this.updateNameNumber(curr.name),
            id: this.generateShortId(),
        };

        this.profiles.push(newProfile);
        this.selectedProfile = this.profiles.length - 1;
        this.handleProfileChange();
        this.renderDropdown();
        profileInput.select();
    }

    renderDropdown() {
        profileInput.value = this.current().name;
        profileList.innerHTML = '';

        this.profiles.forEach((profile, index) => {
            const selectButton = document.createElement('div');
            selectButton.classList.add('profile-select');
            selectButton.value = index;
            selectButton.textContent = profile.name || '(no name)';
            if (this.selectedProfile === index) {
                selectButton.classList.add('highlight');
            }
            selectButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.selectProfile(index);
            });

            if (this.profiles.length > 1) {
                const deleteButton = document.createElement('div');
                deleteButton.className = 'profile-delete';
                deleteButton.textContent = 'X';
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    customConfirm(`Delete ${profile.name}?`, () => {
                        this.deleteProfile(index);
                    }, 'Delete', 'Cancel');
                });

                selectButton.appendChild(deleteButton);
            }
            profileList.appendChild(selectButton);
        });
    }

    rename(newName) {
        this.current().name = newName;
        this.current().id = this.generateShortId();
        this.renderDropdown();
    }

    updateNameNumber(name) {
        const regex = /\((\d+)\)$/;
        const match = name.match(regex);
        if (match) {
            return name.replace(regex, `(${parseInt(match[1])+1})`)
        } else {
            return name + ' (1)';
        }
    }

    generateShortId(length = 9) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }

    valuesEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    sanitizeInput(value, maxLength = 80) {
        if (typeof value !== 'string') {
            return '';
        }
        return (value.length < maxLength) ? value.replace(/<[^>]*>/g, '') : '';
    }

    buildPortableSavedata(source = this.current().savedata) {
        const portable = {};

        for (const [setting, value] of Object.entries(source)) {
            if (!defaultSavedata.hasOwnProperty(setting)) {
                continue;
            }

            if (this.valuesEqual(value, defaultSavedata[setting])) {
                continue;
            }

            const key = compressedSettings[setting] || setting;
            portable[key] = (typeof value === 'boolean') ? (value ? 1 : 0) : value;
        }

        return portable;
    }

    buildProfileCapsule() {
        return {
            app: 'syllogimous',
            type: 'profile',
            version: defaultSavedata.version || 3,
            exportedAt: Date.now(),
            id: this.generateShortId(10),
            name: this.current().name || 'Imported',
            savedata: this.buildPortableSavedata(),
        };
    }

    encodeBase64Url(value) {
        const bytes = new TextEncoder().encode(value);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    decodeBase64Url(value) {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    generateProfileCapsuleText() {
        const capsule = this.buildProfileCapsule();
        return PROFILE_CAPSULE_PREFIX + this.encodeBase64Url(JSON.stringify(capsule));
    }

    generateShareUrl(capsuleText = this.generateProfileCapsuleText()) {
        return `${window.location.origin}${window.location.pathname}#profile=${encodeURIComponent(capsuleText)}`;
    }

    // Backwards-compatible name for any older code that still calls generateUrl().
    generateUrl() {
        return this.generateShareUrl();
    }

    removeImportParams() {
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }

    loadIncomingProfile() {
        const urlObj = new URL(window.location.href);
        const profile = this.parseProfileImport(window.location.href);
        const hasProfilePayload = urlObj.hash.startsWith('#profile=') || urlObj.searchParams.has('savedata');

        if (hasProfilePayload) {
            this.removeImportParams();
        }

        if (!profile) {
            return;
        }

        this.offerImportProfile(profile);
    }

    parseProfileImport(value) {
        if (!value || typeof value !== 'string') {
            return null;
        }

        const trimmed = value.trim();

        try {
            const urlObj = new URL(trimmed);
            if (urlObj.hash.startsWith('#profile=')) {
                return this.decodeProfileCapsule(decodeURIComponent(urlObj.hash.slice('#profile='.length)));
            }

            if (urlObj.searchParams.has('savedata')) {
                return this.decodeLegacyUrlProfile(urlObj.searchParams);
            }
        } catch (error) {
            // Not a URL. Fall through and treat it as a capsule code.
        }

        if (trimmed.startsWith('#profile=')) {
            return this.decodeProfileCapsule(decodeURIComponent(trimmed.slice('#profile='.length)));
        }

        return this.decodeProfileCapsule(trimmed);
    }

    decodeProfileCapsule(capsuleText) {
        try {
            const text = capsuleText.trim();
            if (!text.startsWith(PROFILE_CAPSULE_PREFIX)) {
                return null;
            }

            const decoded = this.decodeBase64Url(text.slice(PROFILE_CAPSULE_PREFIX.length));
            const capsule = JSON.parse(decoded);

            if (capsule.app !== 'syllogimous' || capsule.type !== 'profile' || !capsule.savedata) {
                return null;
            }

            const id = this.sanitizeInput(capsule.id || this.generateShortId(10), 40) || this.generateShortId(10);
            const name = this.sanitizeInput(capsule.name || 'Imported') || 'Imported';
            const savedataObj = this.normalizeImportedSavedata(capsule.savedata);

            return { id, name, savedata: savedataObj };
        } catch (error) {
            return null;
        }
    }

    decodeLegacyUrlProfile(searchParams) {
        try {
            const encodedId = searchParams.get('id');
            const encodedSavedata = searchParams.get('savedata');
            const encodedName = searchParams.get('name');
            if (!encodedId || !encodedSavedata || !encodedName) {
                return null;
            }

            const id = this.sanitizeInput(encodedId, 40);
            if (!id) {
                return null;
            }

            const name = this.sanitizeInput(encodedName) || 'Imported';
            const savedataObj = this.normalizeImportedSavedata(JSON.parse(encodedSavedata));

            return { id, name, savedata: savedataObj };
        } catch (error) {
            return null;
        }
    }

    normalizeImportedSavedata(savedataObj) {
        if (!savedataObj || typeof savedataObj !== 'object' || Array.isArray(savedataObj)) {
            return null;
        }

        const normalized = structuredClone(savedataObj);
        this.uncompressSavedata(normalized);

        const unsafeKeys = Object.keys(normalized);
        for (const key of unsafeKeys) {
            if (!defaultSavedata.hasOwnProperty(key)) {
                delete normalized[key];
                continue;
            }

            if (typeof normalized[key] === 'string') {
                normalized[key] = this.sanitizeInput(normalized[key]);
            }
        }

        for (const [key, defaultValue] of Object.entries(defaultSavedata)) {
            if (!normalized.hasOwnProperty(key)) {
                normalized[key] = structuredClone(defaultValue);
            }
        }

        this.settingsMigration.update(normalized);
        return normalized;
    }

    addImportedProfile(profile) {
        if (!profile || !profile.savedata) {
            showProfileToast('Could not read profile');
            return;
        }

        for (const existing of this.profiles) {
            if (existing.id === profile.id) {
                showProfileToast('Profile already imported');
                return;
            }
        }

        let name = profile.name;
        const existingNames = new Set(this.profiles.map(p => p.name));
        while (existingNames.has(name)) {
            name = this.updateNameNumber(name);
        }

        const newProfile = {
            id: profile.id || this.generateShortId(10),
            name,
            savedata: profile.savedata,
        };

        this.profiles.push(newProfile);
        this.selectedProfile = this.profiles.length - 1;
        this.handleProfileChange();
        this.renderDropdown();
        showProfileToast(`Imported ${newProfile.name}`);
    }

    offerImportProfile(profile) {
        if (!profile || !profile.savedata) {
            showProfileToast('Could not read profile');
            return;
        }

        const changedSettings = Object.entries(profile.savedata).filter(([key, value]) => {
            return defaultSavedata.hasOwnProperty(key) && !this.valuesEqual(value, defaultSavedata[key]);
        }).length;

        const message = `Import profile "${profile.name}"?\n\nChanged settings: ${changedSettings}`;
        if (typeof customConfirm === 'function') {
            customConfirm(message, () => this.addImportedProfile(profile), 'Import', 'Cancel');
        } else if (window.confirm(message)) {
            this.addImportedProfile(profile);
        }
    }

    uncompressSavedata(savedataObj) {
        for (const [setting, compressed] of Object.entries(compressedSettings)) {
            if (savedataObj.hasOwnProperty(compressed)) {
                savedataObj[setting] = savedataObj[compressed];
                delete savedataObj[compressed];
            }
        }

        for (const [setting, value] of Object.entries(savedataObj)) {
            if ((typeof defaultSavedata[setting] === 'boolean') && (typeof value === 'number')) {
                savedataObj[setting] = value === 1 ? true : false;
            }
        }
    }
}

const PROFILE_STORE = new ProfileStore();

profileArrow.addEventListener('click', () => {
    profileList.style.display = profileList.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (event) => {
    if (!profileDropdown.contains(event.target)) {
        profileList.style.display = 'none';
    }
});

profilePlus.addEventListener('click', e => {
    PROFILE_STORE.copySelectedProfile();
});

profileExport.addEventListener('click', async e => {
    const capsuleText = PROFILE_STORE.generateProfileCapsuleText();
    const url = PROFILE_STORE.generateShareUrl(capsuleText);
    const canUseUrl = url.length <= MAX_PROFILE_SHARE_URL_LENGTH;
    const textToCopy = canUseUrl ? url : capsuleText;

    const copied = await copyToClipboard(textToCopy);
    if (!canUseUrl) {
        downloadProfileCapsule(capsuleText, PROFILE_STORE.current().name);
    }

    if (copied) {
        showProfileToast(canUseUrl ? 'Profile link copied' : 'Profile code copied; file downloaded');
    } else {
        showProfileToast('Profile export created');
    }
});

profileImport.addEventListener('click', e => {
    const pasted = window.prompt('Paste a profile link or SYL3 profile code:');
    if (!pasted) {
        return;
    }

    const profile = PROFILE_STORE.parseProfileImport(pasted);
    PROFILE_STORE.offerImportProfile(profile);
});

function triggerOnEnterOrSpace(element) {
    element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            element.click();
        }
    });
}

triggerOnEnterOrSpace(profilePlus);
triggerOnEnterOrSpace(profileExport);
triggerOnEnterOrSpace(profileImport);

async function copyToClipboard(value) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return true;
        }

        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        return copied;
    } catch (error) {
        return false;
    }
}

function showProfileToast(message) {
    profileCopied.textContent = message;
    profileCopied.classList.add('toast');
    setTimeout(() => {
        profileCopied.classList.remove('toast');
    }, 1600);
}

function downloadProfileCapsule(capsuleText, profileName) {
    const safeName = (profileName || 'profile').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'profile';
    const blob = new Blob([capsuleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.sylprofile`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

let saveRename = debounce(() => { PROFILE_STORE.syncProfileChange(); }, 300);
profileInput.addEventListener('input', e => {
    PROFILE_STORE.rename(e.target.value);
    saveRename();
});
