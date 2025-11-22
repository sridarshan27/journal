// Service Worker for RuralCare Telemedicine Platform
// Provides offline functionality and caching for rural areas with poor connectivity

const CACHE_NAME = 'ruralcare-v1.0.0';
const STATIC_CACHE = 'ruralcare-static-v1.0.0';
const DYNAMIC_CACHE = 'ruralcare-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/translations.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (isStaticFile(request.url)) {
        // Serve static files from cache
        event.respondWith(serveFromCache(request, STATIC_CACHE));
    } else if (isAPIRequest(request.url)) {
        // Handle API requests with network-first strategy
        event.respondWith(handleAPIRequest(request));
    } else {
        // Handle other requests with cache-first strategy
        event.respondWith(serveFromCache(request, DYNAMIC_CACHE));
    }
});

// Check if the request is for a static file
function isStaticFile(url) {
    return STATIC_FILES.some(file => url.includes(file)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.html') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg') ||
           url.includes('.gif') ||
           url.includes('.svg') ||
           url.includes('.woff') ||
           url.includes('.woff2') ||
           url.includes('.ttf');
}

// Check if the request is for an API endpoint
function isAPIRequest(url) {
    return url.includes('/api/') ||
           url.includes('pharmacy') ||
           url.includes('health-records') ||
           url.includes('symptoms') ||
           url.includes('consultation');
}

// Serve from cache with fallback to network
async function serveFromCache(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('Serving from cache:', request.url);
            return cachedResponse;
        }

        // If not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the response for future use
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Error serving from cache:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        // Return a basic offline response for other requests
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        // Fallback to cache
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline data for specific API endpoints
        return getOfflineData(request);
    }
}

// Provide offline data for specific API endpoints
function getOfflineData(request) {
    const url = new URL(request.url);
    
    if (url.pathname.includes('pharmacy')) {
        return new Response(JSON.stringify({
            medicines: [
                {
                    id: 1,
                    name: 'Paracetamol 500mg',
                    pharmacy: 'Rural Health Pharmacy',
                    availability: 'available',
                    price: '₹25',
                    distance: '2.5 km'
                },
                {
                    id: 2,
                    name: 'Amoxicillin 250mg',
                    pharmacy: 'Village Medical Store',
                    availability: 'low-stock',
                    price: '₹45',
                    distance: '1.8 km'
                }
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (url.pathname.includes('health-records')) {
        return new Response(JSON.stringify({
            records: []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (url.pathname.includes('symptoms')) {
        return new Response(JSON.stringify({
            analysis: {
                possibleConditions: ['General Malaise'],
                recommendedActions: ['Monitor symptoms', 'Consult healthcare provider if symptoms persist']
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Default offline response
    return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Service temporarily unavailable'
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Background sync for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        console.log('Performing background sync...');
        
        // Sync health records
        await syncHealthRecords();
        
        // Sync pharmacy data
        await syncPharmacyData();
        
        // Sync symptom data
        await syncSymptomData();
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Sync health records with server
async function syncHealthRecords() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const records = await cache.match('/api/health-records');
        
        if (records) {
            const data = await records.json();
            // In a real app, this would send data to server
            console.log('Syncing health records:', data);
        }
    } catch (error) {
        console.error('Error syncing health records:', error);
    }
}

// Sync pharmacy data with server
async function syncPharmacyData() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const pharmacy = await cache.match('/api/pharmacy');
        
        if (pharmacy) {
            const data = await pharmacy.json();
            // In a real app, this would send data to server
            console.log('Syncing pharmacy data:', data);
        }
    } catch (error) {
        console.error('Error syncing pharmacy data:', error);
    }
}

// Sync symptom data with server
async function syncSymptomData() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const symptoms = await cache.match('/api/symptoms');
        
        if (symptoms) {
            const data = await symptoms.json();
            // In a real app, this would send data to server
            console.log('Syncing symptom data:', data);
        }
    } catch (error) {
        console.error('Error syncing symptom data:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Details',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-192x192.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

console.log('Service Worker loaded successfully');
