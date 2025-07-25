/**
 * MARTINOS-DEV Portfolio Website
 * JavaScript principal pour la gestion du loader et des interactions
 * @version 1.0.0
 * @author MARTINOS-DEV
 */

'use strict';

// ========================================
// CONFIGURATION GLOBALE
// ========================================
const CONFIG = {
    LOADER_DURATION: 3000,
    ANIMATION_DELAY: 100,
    SCROLL_OFFSET: 80,
    BREAKPOINTS: {
        mobile: 768,
        tablet: 1024
    }
};

// ========================================
// UTILITAIRES
// ========================================
const Utils = {
    /**
     * Sélecteur d'élément sécurisé
     * @param {string} selector - Sélecteur CSS
     * @returns {Element|null}
     */
    $(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Erreur de sélection: ${selector}`, error);
            return null;
        }
    },

    /**
     * Sélecteur d'éléments multiples sécurisé
     * @param {string} selector - Sélecteur CSS
     * @returns {NodeList|Array}
     */
    $$(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Erreur de sélection multiple: ${selector}`, error);
            return [];
        }
    },

    /**
     * Vérification si un élément existe
     * @param {Element} element - Élément à vérifier
     * @returns {boolean}
     */
    exists(element) {
        return element !== null && element !== undefined;
    },

    /**
     * Debounce function pour optimiser les performances
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Délai d'attente
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Vérification si l'utilisateur préfère les animations réduites
     * @returns {boolean}
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// ========================================
// GESTIONNAIRE DE LOADER
// ========================================
class LoaderManager {
    constructor() {
        this.loader = Utils.$('.modern-loader');
        this.isLoaded = false;
        this.init();
    }

    /**
     * Initialisation du loader
     */
    init() {
        if (!Utils.exists(this.loader)) {
            console.warn('Loader non trouvé');
            return;
        }

        this.showLoader();
        this.startLoadingSequence();
    }

    /**
     * Affichage du loader
     */
    showLoader() {
        if (Utils.exists(this.loader)) {
            this.loader.style.opacity = '1';
            this.loader.style.visibility = 'visible';
            this.loader.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Masquage du loader
     */
    hideLoader() {
        if (Utils.exists(this.loader) && !this.isLoaded) {
            this.isLoaded = true;
            
            // Animation de sortie si les animations sont activées
            if (!Utils.prefersReducedMotion()) {
                this.loader.style.transition = 'opacity 0.8s ease-out, visibility 0.8s ease-out';
            }
            
            this.loader.style.opacity = '0';
            this.loader.style.visibility = 'hidden';
            this.loader.setAttribute('aria-hidden', 'true');
            
            // Suppression du loader du DOM après l'animation
            setTimeout(() => {
                if (Utils.exists(this.loader)) {
                    this.loader.remove();
                }
            }, 1000);
        }
    }

    /**
     * Séquence de chargement
     */
    startLoadingSequence() {
        // Simulation du chargement des ressources
        const loadingSteps = [
            { step: 'Chargement des styles...', progress: 25 },
            { step: 'Chargement des images...', progress: 50 },
            { step: 'Initialisation...', progress: 75 },
            { step: 'Finalisation...', progress: 100 }
        ];

        let currentStep = 0;
        const stepInterval = CONFIG.LOADER_DURATION / loadingSteps.length;

        const updateStep = () => {
            if (currentStep < loadingSteps.length) {
                const loadingText = Utils.$('.loading-text');
                if (Utils.exists(loadingText)) {
                    loadingText.textContent = loadingSteps[currentStep].step;
                }
                currentStep++;
                setTimeout(updateStep, stepInterval);
            } else {
                this.hideLoader();
            }
        };

        setTimeout(updateStep, stepInterval);
    }
}

// ========================================
// GESTIONNAIRE DE NAVIGATION
// ========================================
class NavigationManager {
    constructor() {
        this.nav = Utils.$('nav');
        this.navLinks = Utils.$$('nav a[href^="#"]');
        this.init();
    }

    /**
     * Initialisation de la navigation
     */
    init() {
        this.setupSmoothScrolling();
        this.setupActiveStates();
        this.setupMobileNavigation();
    }

    /**
     * Configuration du défilement fluide
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = Utils.$(`#${targetId}`);
                
                if (Utils.exists(targetElement)) {
                    const offsetTop = targetElement.offsetTop - CONFIG.SCROLL_OFFSET;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Mise à jour de l'état actif
                    this.updateActiveLink(link);
                }
            });
        });
    }

    /**
     * Configuration des états actifs
     */
    setupActiveStates() {
        const sections = Utils.$$('section[id]');
        
        const updateActiveOnScroll = Utils.debounce(() => {
            const scrollPosition = window.scrollY + CONFIG.SCROLL_OFFSET;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    const activeLink = Utils.$(`nav a[href="#${sectionId}"]`);
                    if (Utils.exists(activeLink)) {
                        this.updateActiveLink(activeLink);
                    }
                }
            });
        }, 100);

        window.addEventListener('scroll', updateActiveOnScroll);
    }

    /**
     * Mise à jour du lien actif
     * @param {Element} activeLink - Lien à activer
     */
    updateActiveLink(activeLink) {
        // Suppression de tous les états actifs
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });
        
        // Ajout de l'état actif au lien courant
        if (Utils.exists(activeLink)) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    /**
     * Configuration de la navigation mobile
     */
    setupMobileNavigation() {
        // Ajout d'un bouton menu mobile si nécessaire
        const header = Utils.$('.dual-logo-header');
        if (Utils.exists(header) && window.innerWidth <= CONFIG.BREAKPOINTS.mobile) {
            this.createMobileMenu();
        }
        
        // Écoute du redimensionnement
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth <= CONFIG.BREAKPOINTS.mobile) {
                this.createMobileMenu();
            }
        }, 250));
    }

    /**
     * Création du menu mobile
     */
    createMobileMenu() {
        // Implémentation future si nécessaire
        console.log('Menu mobile activé');
    }
}

// ========================================
// GESTIONNAIRE DE FORMULAIRE
// ========================================
class FormManager {
    constructor() {
        this.form = Utils.$('#contact form');
        this.init();
    }

    /**
     * Initialisation du formulaire
     */
    init() {
        if (!Utils.exists(this.form)) {
            return;
        }

        this.setupValidation();
        this.setupSubmission();
    }

    /**
     * Configuration de la validation
     */
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    /**
     * Validation d'un champ
     * @param {Element} field - Champ à valider
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');
        
        let isValid = true;
        let errorMessage = '';

        // Validation des champs requis
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        }
        
        // Validation de l'email
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer une adresse email valide';
            }
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    /**
     * Affichage d'erreur de champ
     * @param {Element} field - Champ concerné
     * @param {string} message - Message d'erreur
     */
    showFieldError(field, message) {
        const errorElement = Utils.$(`#${field.id}-error`);
        
        if (Utils.exists(errorElement)) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        field.classList.toggle('error', !!message);
        field.setAttribute('aria-invalid', !!message);
    }

    /**
     * Suppression d'erreur de champ
     * @param {Element} field - Champ concerné
     */
    clearError(field) {
        this.showFieldError(field, '');
    }

    /**
     * Configuration de la soumission
     */
    setupSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    /**
     * Gestion de la soumission
     */
    handleSubmit() {
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;

        // Validation de tous les champs
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Soumission du formulaire
            this.submitForm();
        } else {
            // Focus sur le premier champ en erreur
            const firstError = this.form.querySelector('.error');
            if (Utils.exists(firstError)) {
                firstError.focus();
            }
        }
    }

    /**
     * Soumission du formulaire
     */
    submitForm() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        
        if (Utils.exists(submitButton)) {
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Envoi en cours...';
            submitButton.disabled = true;
            
            // Simulation d'envoi
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Ouverture du client email
                this.form.submit();
            }, 1000);
        }
    }
}

// ========================================
// GESTIONNAIRE DE FORMULAIRE WHATSAPP
// ========================================
class WhatsAppFormManager {
    constructor() {
        this.form = Utils.$('#whatsapp-form');
        this.whatsappNumber = '+22898131393'; // Votre numéro WhatsApp
        this.init();
    }

    /**
     * Initialisation du formulaire WhatsApp
     */
    init() {
        if (!Utils.exists(this.form)) {
            return;
        }

        this.setupValidation();
        this.setupSubmission();
    }

    /**
     * Configuration de la validation
     */
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    /**
     * Validation d'un champ
     * @param {Element} field - Champ à valider
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');
        
        let isValid = true;
        let errorMessage = '';

        // Validation des champs requis
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        }
        
        // Validation de l'email
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer une adresse email valide';
            }
        }

        // Validation du numéro de téléphone
        if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer un numéro de téléphone valide';
            }
        }

        // Validation du nom (minimum 2 caractères)
        if (field.name === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Le nom doit contenir au moins 2 caractères';
        }

        // Validation du message (minimum 10 caractères)
        if (field.name === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Le message doit contenir au moins 10 caractères';
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    /**
     * Affichage d'erreur de champ
     * @param {Element} field - Champ concerné
     * @param {string} message - Message d'erreur
     */
    showFieldError(field, message) {
        const errorElement = Utils.$(`#${field.id}-error`);
        
        if (Utils.exists(errorElement)) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        field.classList.toggle('error', !!message);
        field.setAttribute('aria-invalid', !!message);
    }

    /**
     * Suppression d'erreur de champ
     * @param {Element} field - Champ concerné
     */
    clearError(field) {
        this.showFieldError(field, '');
    }

    /**
     * Configuration de la soumission
     */
    setupSubmission() {
        if (!Utils.exists(this.form)) return;
        
        // Gestionnaire pour la soumission du formulaire (au cas où)
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(' Formulaire soumis, traitement en cours...');
            this.handleSubmit();
        });
        
        // Gestionnaire principal pour le bouton WhatsApp
        const submitButton = this.form.querySelector('.whatsapp-btn');
        if (Utils.exists(submitButton)) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(' Bouton WhatsApp cliqué, traitement en cours...');
                this.handleSubmit();
            });
        } else {
            console.error(' Bouton WhatsApp non trouvé!');
        }
    }

    /**
     * Gestion de la soumission
     */
    handleSubmit() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;

        // Validation de tous les champs requis
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            this.sendToWhatsApp();
        } else {
            // Focus sur le premier champ en erreur
            const firstError = this.form.querySelector('.error');
            if (Utils.exists(firstError)) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Envoi vers WhatsApp
     */
    sendToWhatsApp() {
        const formData = new FormData(this.form);
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const subject = formData.get('subject') || 'Nouveau contact';
        const message = formData.get('message') || '';
        const phone = formData.get('phone') || '';

        // Construction du message WhatsApp
        const whatsappMessage = this.buildWhatsAppMessage(name, email, subject, message, phone);
        
        // Nettoyage du numéro (enlever tous les caractères non numériques)
        const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
        
        // Création de l'URL WhatsApp avec encodage sécurisé
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        console.log(' URL WhatsApp:', whatsappUrl);
        console.log(' Numéro:', cleanNumber);
        console.log(' Message brut:', whatsappMessage);
        console.log(' Message encodé:', encodeURIComponent(whatsappMessage));
        
        // Animation du bouton
        const submitButton = this.form.querySelector('.whatsapp-btn');
        this.animateButton(submitButton, () => {
            // Tentative d'ouverture de WhatsApp avec plusieurs méthodes
            this.openWhatsApp(whatsappUrl);
            
            // Réinitialisation du formulaire après un délai
            setTimeout(() => {
                this.resetForm();
            }, 2000);
        });
    }

    /**
     * Construction du message WhatsApp (version améliorée)
     * @param {string} name - Nom
     * @param {string} email - Email
     * @param {string} subject - Sujet
     * @param {string} message - Message
     * @param {string} phone - Numéro de téléphone
     * @returns {string}
     */
    buildWhatsAppMessage(name, email, subject, message, phone) {
        // Message structuré et simple pour éviter les problèmes d'encodage
        let whatsappMessage = `Bonjour MARTINOS-DEV !

Nouveau contact depuis votre site web :

 Nom : ${name}
 Email : ${email}`;

        // Ajouter le téléphone seulement s'il est fourni
        if (phone && phone.trim() !== '') {
            whatsappMessage += `
 Téléphone : ${phone}`;
        }

        whatsappMessage += `
 Sujet : ${subject}

 Message :
${message}

---
Envoyé depuis martinosdev.com`;

    return whatsappMessage;
}

/**
 * Ouverture de WhatsApp avec méthodes améliorées (sans fermeture du site)
 * @param {string} whatsappUrl - URL WhatsApp
 */
openWhatsApp(whatsappUrl) {
    try {
        console.log(' Tentative d\'ouverture WhatsApp...');
            
        // Méthode 1: window.open avec paramètres spécifiques
        const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
            
        if (opened) {
            console.log(' WhatsApp ouvert dans un nouvel onglet');
            // Ne pas fermer le site, juste indiquer le succès
            return;
        }
            
        // Méthode 2: Lien temporaire si window.open échoue
        console.log(' Fallback: création d\'un lien temporaire...');
        const tempLink = document.createElement('a');
        tempLink.href = whatsappUrl;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
            
        // Ajouter temporairement au DOM
        document.body.appendChild(tempLink);
            
        // Cliquer sur le lien
        tempLink.click();
            
        // Supprimer le lien temporaire
        setTimeout(() => {
            if (document.body.contains(tempLink)) {
                document.body.removeChild(tempLink);
            }
        }, 100);
        
        console.log('✅ Lien WhatsApp cliqué avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture WhatsApp:', error);
        
        // Méthode de secours: afficher le lien à l'utilisateur
        this.showWhatsAppLinkDialog(whatsappUrl);
    }
}

/**
 * Affiche une boîte de dialogue avec le lien WhatsApp
 * @param {string} whatsappUrl - URL WhatsApp
 */
showWhatsAppLinkDialog(whatsappUrl) {
    // Copier le lien dans le presse-papiers
    this.copyToClipboard(whatsappUrl);
    
    // Afficher une alerte avec instructions
    const message = `📱 Pour ouvrir WhatsApp avec votre message :\n\n` +
                   `1️⃣ Le lien a été copié automatiquement\n` +
                   `2️⃣ Collez-le dans votre navigateur\n` +
                   `3️⃣ Ou cliquez sur "OK" puis Ctrl+V\n\n` +
                   `🔗 Lien : ${whatsappUrl.substring(0, 50)}...`;
    
    if (confirm(message + '\n\nVoulez-vous que j\'essaie d\'ouvrir WhatsApp maintenant ?')) {
        // Dernière tentative avec une nouvelle fenêtre
        try {
            window.open(whatsappUrl, 'whatsapp', 'width=400,height=600,scrollbars=yes,resizable=yes');
        } catch (finalError) {
            alert('Veuillez coller le lien copié dans votre navigateur pour ouvrir WhatsApp.');
        }
    }
}

/**
 * Copie du lien dans le presse-papiers
 * @param {string} text - Texte à copier
 */
async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                console.log(' Lien copié dans le presse-papiers');
            } else {
                // Fallback pour les navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
                console.log(' Lien copié (méthode fallback)');
            }
        } catch (error) {
            console.error(' Erreur lors de la copie:', error);
        }
    }

    /**
     * Animation du bouton
     * @param {Element} button - Bouton à animer
     * @param {Function} callback - Fonction de callback
     */
    animateButton(button, callback) {
        if (!Utils.exists(button)) return;

        const originalText = button.innerHTML;
        
        // Animation de chargement
        button.innerHTML = `
            <span class="whatsapp-icon">⏳</span>
            Ouverture de WhatsApp...
        `;
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = `
                <span class="whatsapp-icon">✅</span>
                Message envoyé !
            `;
            
            // Exécution du callback
            callback();
            
            // Restauration du bouton
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }, 1000);
    }

    /**
     * Réinitialisation du formulaire
     */
    resetForm() {
        this.form.reset();
        
        // Suppression des erreurs
        const errorElements = this.form.querySelectorAll('.error-message');
        errorElements.forEach(error => {
            error.style.display = 'none';
        });
        
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
        });
    }
}

// ========================================
// GESTIONNAIRE PRINCIPAL
// ========================================
class App {
    constructor() {
        this.loaderManager = null;
        this.navigationManager = null;
        this.formManager = null;
        this.whatsappFormManager = null;
        this.init();
    }

    /**
     * Initialisation de l'application
     */
    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    /**
     * Démarrage de l'application
     */
    start() {
        try {
            console.log(' Initialisation de MARTINOS-DEV Portfolio');
            
            // Initialisation des gestionnaires
            this.loaderManager = new LoaderManager();
            this.navigationManager = new NavigationManager();
            this.formManager = new FormManager();
            this.whatsappFormManager = new WhatsAppFormManager();
            
            // Configuration des événements globaux
            this.setupGlobalEvents();
            
            console.log(' Application initialisée avec succès');
        } catch (error) {
            console.error(' Erreur lors de l\'initialisation:', error);
        }
    }

    /**
     * Configuration des événements globaux
     */
    setupGlobalEvents() {
        // Gestion des erreurs JavaScript
        window.addEventListener('error', (e) => {
            console.error('Erreur JavaScript:', e.error);
        });

        // Gestion des erreurs de ressources
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesse rejetée:', e.reason);
        });

        // Performance monitoring
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(` Page chargée en ${Math.round(loadTime)}ms`);
        });
    }
}

// ========================================
// INITIALISATION
// ========================================
// Création de l'instance principale
const app = new App();