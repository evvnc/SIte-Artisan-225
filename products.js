// Catalogue de produits - L'Artisane
// Structure prête pour 70+ produits

const products = [
    {
        id: 1,
        name: "Sac en cuir Élégance",
        price: 25000,
        image: "images/placeholder-1.jpeg",
        description: "Sac à main en cuir véritable de qualité supérieure. Doublure en coton, fermeture éclair sécurisée. Parfait pour le travail ou les sorties élégantes.",
        category: "sacs-main",
        tags: ["cuir", "élégant", "travail", "qualité"]
    },
    {
        id: 2,
        name: "Pochette Soirée Dorée",
        price: 15000,
        image: "images/placeholder-2.jpeg",
        description: "Petite pochette raffinée pour vos soirées. Finition dorée, chaîne amovible. Idéale pour transporter l'essentiel avec style.",
        category: "pochettes",
        tags: ["soirée", "doré", "chaîne", "raffiné"]
    },
    {
        id: 3,
        name: "Sac Bandoulière Casual",
        price: 18000,
        image: "images/placeholder-3.jpeg",
        description: "Sac bandoulière décontracté en cuir souple. Plusieurs compartiments, bandoulière réglable. Parfait pour le quotidien.",
        category: "sacs-bandouliere",
        tags: ["bandoulière", "décontracté", "quotidien", "pratique"]
    },
    {
        id: 4,
        name: "Sac Cabas Vintage",
        price: 22000,
        image: "images/placeholder-1.jpeg",
        description: "Grand sac cabas au style vintage. Cuir vieilli naturellement, anses renforcées. Spacieux et résistant pour tous vos besoins.",
        category: "sacs-main",
        tags: ["cabas", "vintage", "grand", "résistant"]
    },
    {
        id: 5,
        name: "Pochette Cuir Naturel",
        price: 12000,
        image: "images/placeholder-2.jpeg",
        description: "Pochette en cuir naturel non traité. Texture unique, vieillissement naturel. Fermeture à glissière robuste.",
        category: "pochettes",
        tags: ["cuir naturel", "unique", "fermeture", "robuste"]
    },
    {
        id: 6,
        name: "Sac Shopping Pratique",
        price: 20000,
        image: "images/placeholder-3.jpeg",
        description: "Sac shopping spacieux avec poches intérieures. Anses confortables, fond renforcé. Idéal pour vos courses et sorties.",
        category: "sacs-main",
        tags: ["shopping", "spacieux", "poches", "confortable"]
    },
    {
        id: 7,
        name: "Mini Sac Tendance",
        price: 16000,
        image: "images/placeholder-1.jpeg",
        description: "Petit sac à main tendance. Cuir lisse, couleur intemporelle. Parfait pour les sorties légères et branchées.",
        category: "sacs-main",
        tags: ["mini", "tendance", "lisse", "branché"]
    },
    {
        id: 8,
        name: "Sac Weekend Explorer",
        price: 28000,
        image: "images/placeholder-2.jpeg",
        description: "Sac de weekend en cuir épais. Grande capacité, compartiments organisés. Résiste aux voyages et aventures.",
        category: "sacs-voyage",
        tags: ["weekend", "voyage", "grande capacité", "résistant"]
    },
    {
        id: 9,
        name: "Pochette Phone & Keys",
        price: 8000,
        image: "images/placeholder-3.jpeg",
        description: "Petite pochette compacte pour téléphone et clés. Cuir fin, fermeture magnétique. L'essentiel toujours à portée.",
        category: "pochettes",
        tags: ["compact", "téléphone", "clés", "magnétique"]
    },
    {
        id: 10,
        name: "Sac Business Professionnel",
        price: 32000,
        image: "images/placeholder-1.jpeg",
        description: "Sac professionnel haut de gamme. Compartiment laptop, organisation optimale. Le choix des professionnels exigeants.",
        category: "sacs-business",
        tags: ["professionnel", "laptop", "haut de gamme", "organisation"]
    }
];

// Catégories disponibles
const categories = [
    { id: "sacs-main", name: "Sacs à main", count: 0 },
    { id: "pochettes", name: "Pochettes", count: 0 },
    { id: "sacs-bandouliere", name: "Sacs bandoulière", count: 0 },
    { id: "sacs-voyage", name: "Sacs de voyage", count: 0 },
    { id: "sacs-business", name: "Sacs business", count: 0 }
];

// Fonction utilitaire pour obtenir un produit par ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Fonction pour obtenir des produits par catégorie
function getProductsByCategory(categoryId) {
    return products.filter(product => product.category === categoryId);
}

// Fonction pour obtenir des produits aléatoires (pour suggestions)
function getRandomProducts(excludeId = null, limit = 4) {
    let filteredProducts = products;
    
    if (excludeId) {
        filteredProducts = products.filter(p => p.id !== parseInt(excludeId));
    }
    
    // Mélanger et prendre les premiers
    const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
}

// Fonction de recherche simple
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
}

// Mettre à jour les compteurs de catégories
function updateCategoryCount() {
    categories.forEach(category => {
        category.count = products.filter(p => p.category === category.id).length;
    });
}

// Initialiser les compteurs
updateCategoryCount();

// Export pour utilisation (si modules ES6 utilisés plus tard)
// export { products, categories, getProductById, getProductsByCategory, getRandomProducts, searchProducts };