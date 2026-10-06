// site-config.js - Dynamic site name and logo loader
// Include this script on all pages to load site configuration from Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration (same as main.js)
const firebaseConfig = {
    apiKey: "AIzaSyDdz2xtNPLV_-LO0AxFSoH7voM89aNfhhg",
    authDomain: "judol-fafebian.firebaseapp.com",
    databaseURL: "https://judol-fafebian-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "judol-fafebian",
    storageBucket: "judol-fafebian.firebasestorage.app",
    messagingSenderId: "206aboratoryi21",
    appId: "1:206143081721:web:08c4c0458b7e52d0720749"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Load and apply site configuration
function applySiteConfig() {
    const siteConfigRef = ref(db, 'site_config');

    onValue(siteConfigRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Update site name in all elements with class 'site-name'
            if (data.siteName) {
                document.querySelectorAll('.site-name').forEach(el => {
                    el.textContent = data.siteName;
                });
                // Update page title
                const titleParts = document.title.split(' - ');
                if (titleParts.length > 1) {
                    document.title = `${data.siteName} - ${titleParts.slice(1).join(' - ')}`;
                } else {
                    document.title = data.siteName;
                }
            }

            // Update logo in all elements with class 'site-logo'
            if (data.logoUrl) {
                document.querySelectorAll('.site-logo').forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = data.logoUrl;
                    }
                });
            }
        }
    });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySiteConfig);
} else {
    applySiteConfig();
}
