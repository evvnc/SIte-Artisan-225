// ===== CONFIGURATION ===== 
const CART_STORAGE_KEY = 'site_artisants_cart';
const WHATSAPP_NUMBER = '2250778444981';

// ===== GESTION DU PANIER (localStorage) =====

function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Erreur lecture panier:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Erreur sauvegarde panier:', error);
    }
}

function addToCart(productId) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === parseInt(productId));
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id: parseInt(productId), qty: 1 });
    }
    
    saveCart(cart);
    updateCartUI();
    
    // Re-render si on est sur la page panier
    if (window.location.pathname.includes('panier.html')) {
        renderCartPage();
    }
    
    // Feedback visuel
    showNotification(`Produit ajouté au panier !`);
}
function decrementFromCart(productId) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === parseInt(productId));
    
    if (itemIndex !== -1) {
        cart[itemIndex].qty -= 1;
        
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart(cart);
        updateCartUI();
        
        // Re-render si on est sur la page panier
        if (window.location.pathname.includes('panier.html')) {
            renderCartPage();
        }
    }
}

function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.id !== parseInt(productId));
    
    saveCart(filteredCart);
    updateCartUI();
    
    // Re-render si on est sur la page panier
    if (window.location.pathname.includes('panier.html')) {
        renderCartPage();
    }
    
    showNotification('Produit retiré du panier');
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.qty, 0);
}

function getCartTotal(products) {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);
        return total + (product ? product.price * item.qty : 0);
    }, 0);
}

// ===== UTILITAIRES =====

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showNotification(message) {
    // Créer notification temporaire
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== RENDU DES PAGES =====

function renderProductsGrid(containerId = 'featured-products-grid', limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const productsToShow = limit ? products.slice(0, limit) : products;
    
    container.innerHTML = productsToShow.map(product => `
        <div class="card">
            <a href="product.html?id=${product.id}" class="card__link">
                <img 
                    src="${product.image}" 
                    alt="${product.name}"
                    class="card__img"
                    loading="lazy"
                    onerror="this.src='images/placeholder-1.jpeg'"
                >
                <div class="card__content">
                    <h3 class="card__title">${product.name}</h3>
                    <p class="card__price">${formatPrice(product.price)}</p>
                </div>
            </a>
            <div class="card__actions">
                <button 
                    class="btn btn--primary card__btn" 
                    onclick="addToCart(${product.id})"
                    data-product-id="${product.id}"
                >
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
}

function renderProductDetail() {
    const productId = getQueryParam('id');
    const product = getProductById(parseInt(productId));
    
    const container = document.getElementById('product-detail');
    if (!container) return;
    
    if (!product) {
        container.innerHTML = `
            <div class="product-error">
                <h2>Produit introuvable</h2>
                <p>Le produit demandé n'existe pas ou plus.</p>
                <a href="index.html" class="btn btn--primary">Retour à l'accueil</a>
            </div>
        `;
        return;
    }
    
    // Mettre à jour le titre de la page
    document.title = `${product.name} — L'Artisane`;
    
    container.innerHTML = `
        <div class="product-detail">
            <div class="product-detail__image">
                <img 
                    src="${product.image}" 
                    alt="${product.name}"
                    onerror="this.src='images/placeholder-1.jpeg'"
                >
            </div>
            <div class="product-detail__info">
                <h1 class="product-detail__title">${product.name}</h1>
                <p class="product-detail__price">${formatPrice(product.price)}</p>
                <div class="product-detail__description">
                    <p>${product.description}</p>
                </div>
                <div class="product-detail__category">
                    <span class="category-badge">${categories.find(cat => cat.id === product.category)?.name || 'Produit'}</span>
                </div>
                <button 
                    class="btn btn--primary product-detail__btn" 
                    onclick="addToCart(${product.id})"
                >
                    Ajouter au panier
                </button>
            </div>
        </div>
    `;
}

function renderRelatedProducts() {
    const productId = getQueryParam('id');
    const relatedProducts = getRandomProducts(productId, 4);
    
    const container = document.getElementById('related-products');
    if (!container || relatedProducts.length === 0) return;
    
    container.innerHTML = `
        <h2 class="section-title">Vous aimerez aussi</h2>
        <div class="products-grid">
            ${relatedProducts.map(product => `
                <div class="card">
                    <a href="product.html?id=${product.id}" class="card__link">
                        <img 
                            src="${product.image}" 
                            alt="${product.name}"
                            class="card__img"
                            loading="lazy"
                            onerror="this.src='images/placeholder-1.jpeùg'"
                        >
                        <div class="card__content">
                            <h3 class="card__title">${product.name}</h3>
                            <p class="card__price">${formatPrice(product.price)}</p>
                        </div>
                    </a>
                    <div class="card__actions">
                        <button 
                            class="btn btn--primary card__btn" 
                            onclick="addToCart(${product.id})"
                        >
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== GESTION UI GLOBALE =====

function updateCartUI() {
    // Mettre à jour le badge panier
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        const count = getCartCount();
        cartBadge.textContent = `Panier (${count})`;
    }
    
    // Gérer l'affichage du bouton flottant
    const floatingBtn = document.getElementById('floating-checkout');
    if (floatingBtn) {
        const count = getCartCount();
        floatingBtn.style.display = count > 0 ? 'block' : 'none';
    }
}

function initGlobalUI() {
    // Initialiser le badge panier
    updateCartUI();
    
    // Gestion du menu burger
    const burgerBtn = document.getElementById('burger-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('nav--open');
        });
        
        // Fermer le menu au clic sur un lien
        const navLinks = mainNav.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('nav--open');
            });
        });
    }
    
    // Gestion du bouton flottant
    const floatingBtn = document.getElementById('floating-checkout');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', () => {
            window.location.href = 'panier.html';
        });
    }
}

// ===== WHATSAPP INTEGRATION =====

function openWhatsAppWithCart() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Votre panier est vide');
        return;
    }
    
    let message = "Bonjour, je souhaite commander :\n\n";
    let total = 0;
    
    cart.forEach(item => {
        const product = getProductById(item.id);
        if (product) {
            const subtotal = product.price * item.qty;
            message += `• ${item.qty}x ${product.name} — ${formatPrice(subtotal)}\n`;
            total += subtotal;
        }
    });
    
    message += `\nTOTAL : ${formatPrice(total)}\n\n`;
    message += "Merci de me confirmer la disponibilité et les modalités de livraison.";
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Ouvrir dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
}

// ===== INITIALISATION =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'UI globale sur toutes les pages
    initGlobalUI();
    
    // Actions spécifiques selon la page courante
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/') {
        // Page d'accueil : afficher 6 produits phares
        renderProductsGrid('featured-products-grid', 6);
    }
    
    if (currentPage.includes('products.html')) {
        // Page produits : afficher tous les produits
        renderProductsGrid('all-products-grid');
    }
    
    if (currentPage.includes('product.html')) {
        // Page produit : afficher détail + suggestions
        renderProductDetail();
        renderRelatedProducts();
    }
    
    if (currentPage.includes('panier.html')) {
        // Page panier : afficher contenu panier
        renderCartPage();
    }
    if (currentPage.includes('contact.html')) {
    initContactForm();
}
});

// Fonction pour page panier (sera développée à l'étape suivante)
// ===== FONCTION PANIER COMPLÈTE - ÉTAPE 13 =====
function renderCartPage() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer || !summaryContainer) return;
    
    // PANIER VIDE
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h3>Votre panier est vide</h3>
                <p>Découvrez notre collection de sacs artisanaux faits main.</p>
                <a href="products.html" class="btn btn--primary">Découvrir nos produits</a>
            </div>
        `;
        summaryContainer.innerHTML = '';
        return;
    }
    
    // AFFICHAGE DES ARTICLES
    cartContainer.innerHTML = cart.map(item => {
        const product = getProductById(item.id);
        if (!product) return '';
        
        const subtotal = product.price * item.qty;
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}" 
                        onerror="this.src='images/placeholder-1.jpeg'"
                    >
                </div>
                <div class="cart-item__info">
                    <h4 class="cart-item__name">${product.name}</h4>
                    <p class="cart-item__price">${formatPrice(product.price)} / unité</p>
                </div>
                <div class="cart-item__quantity">
                    <button 
                        class="qty-btn qty-btn--minus" 
                        onclick="decrementFromCart(${item.id})"
                    >
                        −
                    </button>
                    <span class="qty-value">${item.qty}</span>
                    <button 
                        class="qty-btn qty-btn--plus" 
                        onclick="addToCart(${item.id})"
                    >
                        +
                    </button>
                </div>
                <div class="cart-item__subtotal">
                    ${formatPrice(subtotal)}
                </div>
                <div class="cart-item__remove">
                    <button 
                        class="btn btn--danger cart-item__remove-btn" 
                        onclick="removeFromCart(${item.id})"
                        title="Supprimer cet article"
                    >
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // AFFICHAGE RÉSUMÉ
    const total = getCartTotal(products);
    const itemCount = getCartCount();
    
    summaryContainer.innerHTML = `
        <div class="cart-summary">
            <div class="cart-summary__total">
                <h3>Total : ${formatPrice(total)}</h3>
                <p>${itemCount} article${itemCount > 1 ? 's' : ''}</p>
            </div>
            <button 
                class="btn btn--primary cart-summary__checkout" 
                onclick="openWhatsAppWithCart()"
            >
                Commander sur WhatsApp
            </button>
        </div>
    `;
}

let currentFilters = {
    category: 'all',
    search: '',
    sort: 'default'
};

let filteredProducts = [...products];

// ===== FONCTIONS DE FILTRAGE =====

function filterProducts() {
    let result = [...products];
    
    // Filtrer par catégorie
    if (currentFilters.category !== 'all') {
        result = result.filter(product => product.category === currentFilters.category);
    }
    
    // Filtrer par recherche
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        result = result.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // Tri
    switch (currentFilters.sort) {
        case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Ordre par défaut (par ID)
            result.sort((a, b) => a.id - b.id);
    }
    
    filteredProducts = result;
    return result;
}

function renderFilteredProducts() {
    const container = document.getElementById('all-products-grid');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    const products = filterProducts();
    
    // Mettre à jour le compteur
    if (resultsCount) {
        resultsCount.textContent = `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`;
    }
    
    // Afficher les produits ou message vide
    if (products.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    } else {
        container.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        container.innerHTML = products.map(product => `
            <div class="card">
                <a href="product.html?id=${product.id}" class="card__link">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}"
                        class="card__img"
                        loading="lazy"
                        onerror="this.src='images/placeholder-1.jpeg'"
                    >
                    <div class="card__content">
                        <h3 class="card__title">${product.name}</h3>
                        <p class="card__price">${formatPrice(product.price)}</p>
                    </div>
                </a>
                <div class="card__actions">
                    <button 
                        class="btn btn--primary card__btn" 
                        onclick="addToCart(${product.id})"
                    >
                        Ajouter au panier
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ===== GESTIONNAIRES D'ÉVÉNEMENTS =====

function initFiltersAndSearch() {
    // Gestion de la recherche
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        // Recherche en temps réel (avec délai)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = this.value.trim();
                renderFilteredProducts();
            }, 300);
        });
        
        // Recherche au clic sur bouton
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                currentFilters.search = searchInput.value.trim();
                renderFilteredProducts();
            });
        }
        
        // Recherche sur Entrée
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentFilters.search = this.value.trim();
                renderFilteredProducts();
            }
        });
    }
    
    // Gestion des filtres par catégorie
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer classe active des autres boutons
            filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
            
            // Ajouter classe active au bouton cliqué
            this.classList.add('filter-btn--active');
            
            // Appliquer le filtre
            currentFilters.category = this.dataset.category;
            renderFilteredProducts();
        });
    });
    
    // Gestion du tri
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentFilters.sort = this.value;
            renderFilteredProducts();
        });
    }
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
    currentFilters = {
        category: 'all',
        search: '',
        sort: 'default'
    };
    
    // Réinitialiser l'interface
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('filter-btn--active', btn.dataset.category === 'all');
    });
    
    renderFilteredProducts();
}

// ===== MISE À JOUR DE L'INITIALISATION =====

// Mettre à jour la fonction DOMContentLoaded existante
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'UI globale sur toutes les pages
    initGlobalUI();
    
    // Actions spécifiques selon la page courante
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
        // Page d'accueil : afficher 6 produits phares
        renderProductsGrid('featured-products-grid', 6);
    }
    
    if (currentPage.includes('products.html')) {
        // Page produits : initialiser filtres + afficher tous les produits
        initFiltersAndSearch();
        renderFilteredProducts();
    }
    
    if (currentPage.includes('product.html')) {
        // Page produit : afficher détail + suggestions
        renderProductDetail();
        renderRelatedProducts();
    }
    
    if (currentPage.includes('panier.html')) {
        // Page panier : afficher contenu panier
        renderCartPage();
    }
});

// ===== FONCTIONS POUR LA PAGE PANIER (prochaine étape) =====

function renderCartPage() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer || !summaryContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h3>Votre panier est vide</h3>
                <p>Découvrez notre collection de sacs artisanaux.</p>
                <a href="products.html" class="btn btn--primary">Voir les produits</a>
            </div>
        `;
        summaryContainer.innerHTML = '';
        return;
    }
    
    // Afficher les articles du panier
    cartContainer.innerHTML = cart.map(item => {
        const product = getProductById(item.id);
        if (!product) return '';
        
        const subtotal = product.price * item.qty;
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder-1.jpeg'">
                </div>
                <div class="cart-item__info">
                    <h4 class="cart-item__name">${product.name}</h4>
                    <p class="cart-item__price">${formatPrice(product.price)} / unité</p>
                </div>
                <div class="cart-item__quantity">
                    <button class="qty-btn qty-btn--minus" onclick="decrementFromCart(${item.id})">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn qty-btn--plus" onclick="addToCart(${item.id})">+</button>
                </div>
                <div class="cart-item__subtotal">
                    ${formatPrice(subtotal)}
                </div>
                <div class="cart-item__remove">
                    <button class="btn btn--danger cart-item__remove-btn" onclick="removeFromCart(${item.id})">
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Afficher le résumé
    const total = getCartTotal(products);
    summaryContainer.innerHTML = `
        <div class="cart-summary">
            <div class="cart-summary__total">
                <h3>Total : ${formatPrice(total)}</h3>
            </div>
            <button class="btn btn--primary cart-summary__checkout" onclick="openWhatsAppWithCart()">
                Commander sur WhatsApp
            </button>
        </div>
    `;
}
// ===== ÉTAPE 15 : JAVASCRIPT FORMULAIRE CONTACT =====
// À ajouter à la fin de votre fichier script.js

// ===== GESTION FORMULAIRE CONTACT =====
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleContactSubmit);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    // Récupérer les données du formulaire
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        subject: formData.get('subject'),
        message: formData.get('message').trim()
    };
    
    // Validation simple
    if (!data.name || !data.email || !data.subject || !data.message) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Veuillez entrer une adresse email valide', 'error');
        return;
    }
    
    // Construire le message WhatsApp
    const whatsappMessage = buildContactWhatsAppMessage(data);
    
    // Envoyer via WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Feedback utilisateur
    showNotification('Message envoyé via WhatsApp !', 'success');
    
    // Réinitialiser le formulaire après un délai
    setTimeout(() => {
        e.target.reset();
    }, 1000);
}

function buildContactWhatsAppMessage(data) {
    let message = "📧 NOUVEAU MESSAGE DE CONTACT\n\n";
    
    message += `👤 Nom : ${data.name}\n`;
    message += `📧 Email : ${data.email}\n`;
    
    if (data.phone) {
        message += `📱 Téléphone : ${data.phone}\n`;
    }
    
    message += `📝 Sujet : ${getSubjectLabel(data.subject)}\n\n`;
    message += `💬 Message :\n${data.message}\n\n`;
    message += `---\nMessage envoyé depuis le formulaire de contact du site L'Artisane`;
    
    return message;
}

function getSubjectLabel(subjectValue) {
    const subjects = {
        'commande': 'Question sur une commande',
        'produit': 'Renseignement produit', 
        'livraison': 'Livraison',
        'autre': 'Autre'
    };
    return subjects[subjectValue] || subjectValue;
}

// ===== AMÉLIORER LA FONCTION SHOWNOTIFICATION =====
// Remplacer la fonction showNotification existante par celle-ci :

function showNotification(message, type = 'success') {
    // Supprimer notification existante s'il y en a une
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Créer nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Styles de base
    const baseStyles = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Couleurs selon le type
    let typeStyles = '';
    if (type === 'success') {
        typeStyles = 'background: #28a745; color: white;';
    } else if (type === 'error') {
        typeStyles = 'background: #dc3545; color: white;';
    } else if (type === 'warning') {
        typeStyles = 'background: #ffc107; color: #333;';
    }
    
    notification.style.cssText = baseStyles + typeStyles;
    
    document.body.appendChild(notification);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// ===== MISE À JOUR DE LA FONCTION D'INITIALISATION =====
// Trouver la fonction DOMContentLoaded existante et ajouter cette ligne :

// Dans votre fonction DOMContentLoaded existante, ajouter :
// if (currentPage.includes('contact.html')) {
//     initContactForm();
// }