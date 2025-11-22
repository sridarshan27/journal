// RuralCare Configuration
// Scalable configuration for multiple regions in India

const RuralCareConfig = {
    // Application settings
    app: {
        name: 'RuralCare with X',
        version: '1.0.0',
        description: 'Telemedicine Platform for Rural India',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'te', 'ta', 'bn', 'gu'],
        region: 'IN', // India
        timezone: 'Asia/Kolkata'
    },

    // Regional configurations
    regions: {
        'north': {
            name: 'North India',
            states: ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'],
            primaryLanguage: 'hi',
            secondaryLanguages: ['en', 'pa'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        },
        'south': {
            name: 'South India',
            states: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana'],
            primaryLanguage: 'te',
            secondaryLanguages: ['ta', 'en', 'ml', 'kn'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        },
        'east': {
            name: 'East India',
            states: ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal'],
            primaryLanguage: 'bn',
            secondaryLanguages: ['hi', 'en', 'or'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        },
        'west': {
            name: 'West India',
            states: ['Goa', 'Gujarat', 'Maharashtra'],
            primaryLanguage: 'gu',
            secondaryLanguages: ['mr', 'en', 'hi'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        },
        'central': {
            name: 'Central India',
            states: ['Chhattisgarh', 'Madhya Pradesh'],
            primaryLanguage: 'hi',
            secondaryLanguages: ['en', 'gu'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        },
        'northeast': {
            name: 'Northeast India',
            states: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'],
            primaryLanguage: 'en',
            secondaryLanguages: ['as', 'bn', 'hi'],
            timezone: 'Asia/Kolkata',
            emergencyNumber: '108',
            healthHelpline: '104'
        }
    },

    // API endpoints for different regions
    api: {
        baseUrl: 'https://api.ruralcare.in',
        regions: {
            'north': 'https://north-api.ruralcare.in',
            'south': 'https://south-api.ruralcare.in',
            'east': 'https://east-api.ruralcare.in',
            'west': 'https://west-api.ruralcare.in',
            'central': 'https://central-api.ruralcare.in',
            'northeast': 'https://northeast-api.ruralcare.in'
        },
        endpoints: {
            doctors: '/api/doctors',
            consultations: '/api/consultations',
            healthRecords: '/api/health-records',
            pharmacy: '/api/pharmacy',
            symptoms: '/api/symptoms',
            notifications: '/api/notifications',
            emergency: '/api/emergency',
            chat: '/api/chat'
        }
    },

    // Video consultation settings
    video: {
        maxParticipants: 2,
        maxDuration: 3600000, // 1 hour in milliseconds
        quality: {
            low: { width: 320, height: 240, frameRate: 15 },
            medium: { width: 640, height: 480, frameRate: 30 },
            high: { width: 1280, height: 720, frameRate: 30 }
        },
        bandwidth: {
            low: 128, // kbps
            medium: 512, // kbps
            high: 1024 // kbps
        }
    },

    // Offline settings
    offline: {
        cacheSize: 50 * 1024 * 1024, // 50MB
        syncInterval: 300000, // 5 minutes
        maxRetries: 3,
        retryDelay: 5000 // 5 seconds
    },

    // Pharmacy settings
    pharmacy: {
        maxDistance: 50, // km
        updateInterval: 300000, // 5 minutes
        supportedTypes: ['allopathic', 'ayurvedic', 'homeopathic', 'unani'],
        emergencyMedicines: [
            'insulin',
            'epinephrine',
            'nitroglycerin',
            'albuterol',
            'morphine'
        ]
    },

    // AI symptom checker settings
    ai: {
        model: 'ruralcare-symptoms-v1',
        confidenceThreshold: 0.7,
        maxConditions: 5,
        emergencyKeywords: [
            'chest pain',
            'difficulty breathing',
            'severe headache',
            'loss of consciousness',
            'severe bleeding',
            'stroke',
            'heart attack'
        ],
        lowBandwidthMode: true
    },

    // Health records settings
    healthRecords: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
        encryption: true
    },

    // Notification settings
    notifications: {
        types: ['consultation', 'prescription', 'appointment', 'emergency', 'general'],
        channels: ['push', 'sms', 'email', 'whatsapp'],
        priority: {
            emergency: 1,
            consultation: 2,
            prescription: 3,
            appointment: 4,
            general: 5
        }
    },

    // Security settings
    security: {
        encryptionKey: 'ruralcare-encryption-key-2024',
        sessionTimeout: 1800000, // 30 minutes
        maxLoginAttempts: 5,
        lockoutDuration: 900000, // 15 minutes
        requireHTTPS: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; media-src 'self' blob:; connect-src 'self' https://api.ruralcare.in;"
    },

    // Analytics settings
    analytics: {
        enabled: true,
        trackingId: 'RURALCARE-2024',
        events: [
            'consultation_started',
            'consultation_ended',
            'symptom_checked',
            'medicine_searched',
            'record_added',
            'language_changed',
            'offline_mode',
            'error_occurred'
        ],
        privacyMode: true
    },

    // Feature flags
    features: {
        videoConsultation: true,
        healthRecords: true,
        pharmacySearch: true,
        symptomChecker: true,
        offlineMode: true,
        pushNotifications: true,
        multiLanguage: true,
        emergencyMode: true,
        voiceInput: false, // Coming soon
        biometricAuth: false, // Coming soon
        telemedicine: true,
        aiDiagnostics: true
    },

    // Development settings
    development: {
        debug: false,
        mockData: true,
        logLevel: 'info',
        apiTimeout: 30000, // 30 seconds
        enableServiceWorker: true,
        enablePWA: true
    }
};

// Regional detection and configuration
class RegionalConfig {
    constructor() {
        this.currentRegion = this.detectRegion();
        this.config = this.getRegionalConfig();
    }

    detectRegion() {
        // Try to detect region based on user's location or language preference
        const savedRegion = localStorage.getItem('ruralcare_region');
        if (savedRegion && RuralCareConfig.regions[savedRegion]) {
            return savedRegion;
        }

        // Detect based on browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];

        // Map language to region
        const langToRegion = {
            'hi': 'north',
            'te': 'south',
            'ta': 'south',
            'bn': 'east',
            'gu': 'west',
            'mr': 'west',
            'en': 'northeast'
        };

        return langToRegion[langCode] || 'north'; // Default to north
    }

    getRegionalConfig() {
        const regionConfig = RuralCareConfig.regions[this.currentRegion];
        return {
            ...RuralCareConfig,
            region: this.currentRegion,
            regionConfig: regionConfig,
            api: {
                ...RuralCareConfig.api,
                baseUrl: RuralCareConfig.api.regions[this.currentRegion] || RuralCareConfig.api.baseUrl
            }
        };
    }

    setRegion(region) {
        if (RuralCareConfig.regions[region]) {
            this.currentRegion = region;
            this.config = this.getRegionalConfig();
            localStorage.setItem('ruralcare_region', region);
            return true;
        }
        return false;
    }

    getSupportedLanguages() {
        return this.config.regionConfig.primaryLanguage ? 
            [this.config.regionConfig.primaryLanguage, ...this.config.regionConfig.secondaryLanguages] :
            RuralCareConfig.app.supportedLanguages;
    }

    getEmergencyNumber() {
        return this.config.regionConfig.emergencyNumber || '108';
    }

    getHealthHelpline() {
        return this.config.regionConfig.healthHelpline || '104';
    }
}

// Initialize regional configuration
const regionalConfig = new RegionalConfig();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RuralCareConfig, RegionalConfig, regionalConfig };
} else {
    window.RuralCareConfig = RuralCareConfig;
    window.RegionalConfig = RegionalConfig;
    window.regionalConfig = regionalConfig;
}
