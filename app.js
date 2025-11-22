// RuralCare Telemedicine Application
// Main application logic for video consultations, health records, pharmacy, and AI symptom checker

class RuralCareApp {
	constructor() {
		this.localStream = null;
		this.remoteStream = null;
		this.peerConnection = null;
		this.isCallActive = false;
		this.isAuthenticated = !!localStorage.getItem('ruralcare_token');
		this.healthRecords = [];
		this.pharmacyData = [];
		this.symptomData = {};
		this.isOnline = navigator.onLine;
		this.chatHistory = [];
		
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.loadHealthRecords();
		this.loadPharmacyData();
		this.setupOfflineSupport();
		this.setupVideoCall();
		this.setupSymptomChecker();
		this.setupChatbot();
	}

	setupEventListeners() {
		// Mobile menu toggle
		const hamburger = document.querySelector('.hamburger');
		const navMenu = document.querySelector('.nav-menu');
		
		if (hamburger && navMenu) {
			hamburger.addEventListener('click', () => {
				navMenu.classList.toggle('active');
			});
		}

		// Online/Offline status
		window.addEventListener('online', () => {
			this.isOnline = true;
			this.updateOfflineIndicator();
			this.syncOfflineData();
		});

		window.addEventListener('offline', () => {
			this.isOnline = false;
			this.updateOfflineIndicator();
		});

		// Video call controls
		const startCallBtn = document.getElementById('startCall');
		const endCallBtn = document.getElementById('endCall');
		const toggleMicBtn = document.getElementById('toggleMic');
		const toggleCameraBtn = document.getElementById('toggleCamera');

		if (startCallBtn) startCallBtn.addEventListener('click', () => this.startVideoCall());
		if (endCallBtn) endCallBtn.addEventListener('click', () => this.endVideoCall());
		if (toggleMicBtn) toggleMicBtn.addEventListener('click', () => this.toggleMicrophone());
		if (toggleCameraBtn) toggleCameraBtn.addEventListener('click', () => this.toggleCamera());

		// Auth buttons
		const loginBtn = document.getElementById('loginBtn');
		const logoutBtn = document.getElementById('logoutBtn');
		const loginModal = document.getElementById('loginModal');
		const loginClose = document.getElementById('loginClose');
		const loginSubmit = document.getElementById('loginSubmit');

		if (loginBtn) loginBtn.addEventListener('click', () => this.showLogin());
		if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
		if (loginClose) loginClose.addEventListener('click', () => this.hideLogin());
		if (loginModal) loginModal.addEventListener('click', (e) => {
			if (e.target === loginModal) this.hideLogin();
		});
		if (loginSubmit) loginSubmit.addEventListener('click', () => this.handleLogin());

		// Smooth scrolling for navigation
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', function (e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href'));
				if (target) {
					target.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}
			});
		});

		// Reflect auth state in UI on load
		this.updateAuthUI();
		this.updateLockState();
	}

	setupOfflineSupport() {
		// Register service worker for offline functionality
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('sw.js')
				.then(registration => {
					console.log('Service Worker registered successfully');
				})
				.catch(error => {
					console.log('Service Worker registration failed');
				});
		}

		// Setup IndexedDB for offline storage
		this.setupIndexedDB();
	}

	setupIndexedDB() {
		const request = indexedDB.open('RuralCareDB', 1);

		request.onerror = () => {
			console.error('IndexedDB failed to open');
		};

		request.onsuccess = () => {
			this.db = request.result;
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			
			// Health records store
			if (!db.objectStoreNames.contains('healthRecords')) {
				const healthStore = db.createObjectStore('healthRecords', { keyPath: 'id', autoIncrement: true });
				healthStore.createIndex('date', 'date', { unique: false });
				healthStore.createIndex('type', 'type', { unique: false });
			}

			// Pharmacy data store
			if (!db.objectStoreNames.contains('pharmacyData')) {
				const pharmacyStore = db.createObjectStore('pharmacyData', { keyPath: 'id', autoIncrement: true });
				pharmacyStore.createIndex('medicine', 'medicine', { unique: false });
				pharmacyStore.createIndex('pharmacy', 'pharmacy', { unique: false });
			}

			// Symptom data store
			if (!db.objectStoreNames.contains('symptomData')) {
				db.createObjectStore('symptomData', { keyPath: 'id', autoIncrement: true });
			}
		};
	}

	updateOfflineIndicator() {
		const indicator = document.querySelector('.offline-indicator');
		if (indicator) {
			if (this.isOnline) {
				indicator.classList.remove('offline');
				indicator.innerHTML = '<i class="fas fa-wifi"></i><span data-translate="offline_status">Online</span>';
			} else {
				indicator.classList.add('offline');
				indicator.innerHTML = '<i class="fas fa-wifi-slash"></i><span data-translate="offline_status">Offline</span>';
			}
			updateTranslations();
		}
	}

	// Video Call Functionality
	setupVideoCall() {
		this.localVideo = document.getElementById('localVideo');
		this.remoteVideo = document.getElementById('remoteVideo');
	}

	async startVideoCall() {
		try {
			// Get user media
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true
			});

			this.localVideo.srcObject = this.localStream;
			this.isCallActive = true;

			// Update UI
			document.getElementById('startCall').style.display = 'none';
			document.getElementById('endCall').style.display = 'inline-block';

			// Simulate remote video (in real app, this would be from WebRTC)
			this.simulateRemoteVideo();

			this.showNotification('Call started successfully', 'success');

		} catch (error) {
			console.error('Error accessing camera/microphone:', error);
			this.showNotification('Unable to access camera/microphone', 'error');
		}
	}

	simulateRemoteVideo() {
		// In a real implementation, this would be the remote stream from WebRTC
		// For demo purposes, we'll show a placeholder
		const canvas = document.createElement('canvas');
		canvas.width = 640;
		canvas.height = 480;
		const ctx = canvas.getContext('2d');
		
		// Draw a simple pattern to simulate remote video
		const drawFrame = () => {
			ctx.fillStyle = '#2c3e50';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			ctx.fillStyle = '#3498db';
			ctx.font = '24px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('Doctor Video Feed', canvas.width/2, canvas.height/2);
			
			this.remoteVideo.srcObject = canvas.captureStream(30);
			
			if (this.isCallActive) {
				requestAnimationFrame(drawFrame);
			}
		};
		
		drawFrame();
	}

	endVideoCall() {
		if (this.localStream) {
			this.localStream.getTracks().forEach(track => track.stop());
		}
		
		this.localVideo.srcObject = null;
		this.remoteVideo.srcObject = null;
		this.isCallActive = false;

		// Update UI
		document.getElementById('startCall').style.display = 'inline-block';
		document.getElementById('endCall').style.display = 'none';

		this.showNotification('Call ended', 'info');
	}

	toggleMicrophone() {
		if (this.localStream) {
			const audioTrack = this.localStream.getAudioTracks()[0];
			if (audioTrack) {
				audioTrack.enabled = !audioTrack.enabled;
				const micBtn = document.getElementById('toggleMic');
				micBtn.innerHTML = audioTrack.enabled ? 
					'<i class="fas fa-microphone"></i>' : 
					'<i class="fas fa-microphone-slash"></i>';
				
				this.showNotification(
					audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted', 
					'info'
				);
			}
		}
	}

	toggleCamera() {
		if (this.localStream) {
			const videoTrack = this.localStream.getVideoTracks()[0];
			if (videoTrack) {
				videoTrack.enabled = !videoTrack.enabled;
				const cameraBtn = document.getElementById('toggleCamera');
				cameraBtn.innerHTML = videoTrack.enabled ? 
					'<i class="fas fa-video"></i>' : 
					'<i class="fas fa-video-slash"></i>';
				
				this.showNotification(
					videoTrack.enabled ? 'Camera on' : 'Camera off', 
					'info'
				);
			}
		}
	}

	// Health Records Management
	loadHealthRecords() {
		// Load from IndexedDB
		if (this.db) {
			const transaction = this.db.transaction(['healthRecords'], 'readonly');
			const store = transaction.objectStore('healthRecords');
			const request = store.getAll();

			request.onsuccess = () => {
				this.healthRecords = request.result || [];
				this.displayHealthRecords();
			};
		} else {
			// Fallback to localStorage
			const stored = localStorage.getItem('ruralcare_health_records');
			this.healthRecords = stored ? JSON.parse(stored) : [];
			this.displayHealthRecords();
		}
	}

	displayHealthRecords() {
		const recordsList = document.getElementById('recordsList');
		if (!recordsList) return;

		if (this.healthRecords.length === 0) {
			recordsList.innerHTML = '<p data-translate="no_records_found">No health records found</p>';
			updateTranslations();
			return;
		}

		recordsList.innerHTML = this.healthRecords.map(record => `
			<div class="record-item">
				<div class="record-info">
					<h4>${record.type}</h4>
					<p><strong data-translate="record_date">Date:</strong> ${new Date(record.date).toLocaleDateString()}</p>
					<p><strong data-translate="record_doctor">Doctor:</strong> ${record.doctor}</p>
					<p><strong data-translate="record_notes">Notes:</strong> ${record.notes}</p>
				</div>
				<div class="record-actions">
					<button class="btn btn-secondary" onclick="app.editRecord(${record.id})" data-translate="btn_edit">Edit</button>
					<button class="btn btn-danger" onclick="app.deleteRecord(${record.id})" data-translate="btn_delete">Delete</button>
				</div>
			</div>
		`).join('');

		updateTranslations();
	}

	addNewRecord() {
		const type = prompt('Record type (e.g., Consultation, Prescription, Test Result):');
		if (!type) return;

		const doctor = prompt('Doctor name:');
		if (!doctor) return;

		const notes = prompt('Notes:');
		if (!notes) return;

		const newRecord = {
			id: Date.now(),
			type: type,
			doctor: doctor,
			notes: notes,
			date: new Date().toISOString()
		};

		this.healthRecords.push(newRecord);
		this.saveHealthRecords();
		this.displayHealthRecords();
		this.showNotification('Health record added successfully', 'success');
	}

	editRecord(id) {
		const record = this.healthRecords.find(r => r.id === id);
		if (!record) return;

		const newType = prompt('Record type:', record.type);
		if (newType) record.type = newType;

		const newDoctor = prompt('Doctor name:', record.doctor);
		if (newDoctor) record.doctor = newDoctor;

		const newNotes = prompt('Notes:', record.notes);
		if (newNotes) record.notes = newNotes;

		this.saveHealthRecords();
		this.displayHealthRecords();
		this.showNotification('Health record updated successfully', 'success');
	}

	deleteRecord(id) {
		if (confirm('Are you sure you want to delete this record?')) {
			this.healthRecords = this.healthRecords.filter(r => r.id !== id);
			this.saveHealthRecords();
			this.displayHealthRecords();
			this.showNotification('Health record deleted successfully', 'success');
		}
	}

	saveHealthRecords() {
		if (this.db) {
			const transaction = this.db.transaction(['healthRecords'], 'readwrite');
			const store = transaction.objectStore('healthRecords');
			store.clear();
			this.healthRecords.forEach(record => store.add(record));
		} else {
			localStorage.setItem('ruralcare_health_records', JSON.stringify(this.healthRecords));
		}
	}

	syncRecords() {
		if (this.isOnline) {
			// In a real app, this would sync with the server
			this.showNotification('Records synced successfully', 'success');
		} else {
			this.showNotification('Cannot sync while offline', 'error');
		}
	}

	// Pharmacy Management
	loadPharmacyData() {
		// Sample pharmacy data - in real app, this would come from an API
		this.pharmacyData = [
			{
				id: 1,
				medicine: 'Paracetamol 500mg',
				pharmacy: 'Rural Health Pharmacy',
				availability: 'available',
				price: '₹25',
				distance: '2.5 km',
				stock: 50
			},
			{
				id: 2,
				medicine: 'Amoxicillin 250mg',
				pharmacy: 'Village Medical Store',
				availability: 'low-stock',
				price: '₹45',
				distance: '1.8 km',
				stock: 5
			},
			{
				id: 3,
				medicine: 'Insulin 100IU',
				pharmacy: 'District Health Center',
				availability: 'out-of-stock',
				price: '₹180',
				distance: '5.2 km',
				stock: 0
			},
			{
				id: 4,
				medicine: 'Metformin 500mg',
				pharmacy: 'Rural Health Pharmacy',
				availability: 'available',
				price: '₹35',
				distance: '2.5 km',
				stock: 25
			}
		];
	}

	searchMedicine() {
		const searchTerm = document.getElementById('medicineSearch').value.toLowerCase();
		const results = this.pharmacyData.filter(item => 
			item.medicine.toLowerCase().includes(searchTerm) ||
			item.pharmacy.toLowerCase().includes(searchTerm)
		);

		this.displayPharmacyResults(results);
	}

	displayPharmacyResults(results) {
		const resultsContainer = document.getElementById('pharmacyResults');
		if (!resultsContainer) return;

		if (results.length === 0) {
			resultsContainer.innerHTML = '<p data-translate="no_medicines_found">No medicines found</p>';
			updateTranslations();
			return;
		}

		resultsContainer.innerHTML = results.map(item => `
			<div class="pharmacy-item">
				<div class="pharmacy-info">
					<h4>${item.medicine}</h4>
					<p><strong data-translate="pharmacy_name">Pharmacy:</strong> ${item.pharmacy}</p>
					<p><strong data-translate="price">Price:</strong> ${item.price} | <strong data-translate="distance">Distance:</strong> ${item.distance}</p>
				</div>
				<div class="availability ${item.availability}">
					${this.getAvailabilityText(item.availability, item.stock)}
				</div>
			</div>
		`).join('');

		updateTranslations();
	}

	getAvailabilityText(availability, stock) {
		switch (availability) {
			case 'available':
				return `Available (${stock} units)`;
			case 'low-stock':
				return `Low Stock (${stock} units)`;
			case 'out-of-stock':
				return 'Out of Stock';
			default:
				return 'Unknown';
		}
	}

	// AI Symptom Checker
	setupSymptomChecker() {
		const symptomBtns = document.querySelectorAll('.symptom-btn');
		symptomBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				btn.classList.toggle('selected');
			});
		});
	}

	analyzeSymptoms() {
		const description = document.getElementById('symptomDescription').value;
		const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-btn.selected'))
			.map(btn => btn.textContent);

		if (!description && selectedSymptoms.length === 0) {
			this.showNotification('Please describe your symptoms or select from the options', 'error');
			return;
		}

		// Show loading
		const resultsContainer = document.getElementById('symptomResults');
		resultsContainer.innerHTML = '<div class="loading"></div><p data-translate="loading">Loading...</p>';
		updateTranslations();

		// Simulate AI analysis (in real app, this would call an AI service)
		setTimeout(() => {
			this.performSymptomAnalysis(description, selectedSymptoms);
		}, 2000);
	}

	performSymptomAnalysis(description, selectedSymptoms) {
		const resultsContainer = document.getElementById('symptomResults');
		
		// Simple symptom analysis logic (in real app, this would be AI-powered)
		const allSymptoms = [...selectedSymptoms, ...description.toLowerCase().split(' ')];
		
		let possibleConditions = [];
		let recommendedActions = [];
		
		// Basic symptom matching
		if (allSymptoms.some(s => ['fever', 'temperature', 'hot'].includes(s.toLowerCase()))) {
			possibleConditions.push('Viral Infection', 'Bacterial Infection');
			recommendedActions.push('Rest and stay hydrated', 'Monitor temperature');
		}
		
		if (allSymptoms.some(s => ['cough', 'chest', 'breathing'].includes(s.toLowerCase()))) {
			possibleConditions.push('Respiratory Infection', 'Allergy');
			recommendedActions.push('Avoid irritants', 'Use humidifier');
		}
		
		if (allSymptoms.some(s => ['headache', 'head', 'pain'].includes(s.toLowerCase()))) {
			possibleConditions.push('Tension Headache', 'Migraine');
			recommendedActions.push('Rest in dark room', 'Apply cold compress');
		}
		
		if (allSymptoms.some(s => ['nausea', 'vomit', 'stomach'].includes(s.toLowerCase()))) {
			possibleConditions.push('Gastrointestinal Issue', 'Food Poisoning');
			recommendedActions.push('Stay hydrated', 'Avoid solid foods temporarily');
		}
		
		if (allSymptoms.some(s => ['fatigue', 'tired', 'weak'].includes(s.toLowerCase()))) {
			possibleConditions.push('Anemia', 'Viral Infection');
			recommendedActions.push('Get adequate rest', 'Check iron levels');
		}
		
		// Default if no specific symptoms detected
		if (possibleConditions.length === 0) {
			possibleConditions.push('General Malaise');
			recommendedActions.push('Monitor symptoms', 'Consult healthcare provider if symptoms persist');
		}
		
		resultsContainer.innerHTML = `
			<h3 data-translate="symptom_analysis">Symptom Analysis</h3>
			<div class="analysis-result">
				<h4 data-translate="possible_conditions">Possible Conditions:</h4>
				<ul>
					${possibleConditions.map(condition => `<li>${condition}</li>`).join('')}
				</ul>
				
				<h4 data-translate="recommended_actions">Recommended Actions:</h4>
				<ul>
					${recommendedActions.map(action => `<li>${action}</li>`).join('')}
				</ul>
				
				<div class="emergency-warning">
					<p data-translate="emergency_warning">⚠️ If you experience severe symptoms, please seek immediate medical attention</p>
				</div>
			</div>
		`;
		
		updateTranslations();
		
		// Save analysis to offline storage
		this.saveSymptomAnalysis({
			description,
			selectedSymptoms,
			possibleConditions,
			recommendedActions,
			timestamp: new Date().toISOString()
		});
	}

	saveSymptomAnalysis(analysis) {
		if (this.db) {
			const transaction = this.db.transaction(['symptomData'], 'readwrite');
			const store = transaction.objectStore('symptomData');
			store.add(analysis);
		} else {
			const stored = localStorage.getItem('ruralcare_symptom_data') || '[]';
			const data = JSON.parse(stored);
			data.push(analysis);
			localStorage.setItem('ruralcare_symptom_data', JSON.stringify(data));
		}
	}

	syncOfflineData() {
		// In a real app, this would sync all offline data with the server
		this.showNotification('Offline data synced successfully', 'success');
	}

	// Chatbot
	setupChatbot() {
		this.chatToggle = document.getElementById('chatbotToggle');
		this.chatPanel = document.getElementById('chatbotPanel');
		this.chatMessages = document.getElementById('chatbotMessages');
		this.chatInput = document.getElementById('chatbotInput');
		this.chatSend = document.getElementById('chatbotSend');

		if (this.chatToggle && this.chatPanel) {
			this.chatToggle.addEventListener('click', () => {
				const isOpen = this.chatPanel.style.display === 'block';
				this.chatPanel.style.display = isOpen ? 'none' : 'block';
				if (!isOpen && this.chatMessages && this.chatMessages.children.length === 0) {
					this.appendBotMessage('Hi! I am your medical assistant. Describe your symptoms or ask a health question.');
				}
			});
		}
		if (this.chatSend && this.chatInput) {
			this.chatSend.addEventListener('click', () => this.sendChatMessage());
			this.chatInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					this.sendChatMessage();
				}
			});
		}
	}

	appendUserMessage(text) {
		if (!this.chatMessages) return;
		const msg = document.createElement('div');
		msg.className = 'message user';
		msg.innerHTML = `<div class="bubble">${this.escapeHtml(text)}</div>`;
		this.chatMessages.appendChild(msg);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	appendBotMessage(text) {
		if (!this.chatMessages) return;
		const msg = document.createElement('div');
		msg.className = 'message bot';
		msg.innerHTML = `<div class="bubble">${this.escapeHtml(text)}</div>`;
		this.chatMessages.appendChild(msg);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	sendChatMessage() {
		const text = (this.chatInput && this.chatInput.value || '').trim();
		if (!text) return;
		this.appendUserMessage(text);
		this.chatInput.value = '';
		this.chatHistory.push({ role: 'user', content: text, ts: Date.now() });

		// Show typing indicator
		const typing = document.createElement('div');
		typing.className = 'message bot';
		typing.innerHTML = '<div class="bubble"><i class="fas fa-ellipsis-h fa-bounce"></i> typing…</div>';
		this.chatMessages.appendChild(typing);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

		const handleResponse = (reply) => {
			if (typing.parentNode) typing.parentNode.removeChild(typing);
			this.appendBotMessage(reply);
			this.chatHistory.push({ role: 'assistant', content: reply, ts: Date.now() });
		};

		if (this.isOnline) {
			const base = (window.regionalConfig && window.regionalConfig.config && window.regionalConfig.config.api && window.regionalConfig.config.api.baseUrl) || (window.RuralCareConfig && window.RuralCareConfig.api.baseUrl) || '';
			const endpoint = (window.RuralCareConfig && window.RuralCareConfig.api.endpoints.chat) || '/api/chat';
			const url = base + endpoint;
			// Demo: fallback to mock if endpoint not reachable
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 6000);
			fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: this.chatHistory.slice(-10) }),
				signal: controller.signal
			}).then(r => r.ok ? r.json() : Promise.reject(new Error('Bad status')))
			.then(data => {
				clearTimeout(timeout);
				const reply = (data && (data.reply || data.message)) || this.generateLocalChatReply(text);
				handleResponse(reply);
			})
			.catch(() => {
				clearTimeout(timeout);
				handleResponse(this.generateLocalChatReply(text));
			});
		} else {
			handleResponse(this.generateLocalChatReply(text));
		}
	}

	generateLocalChatReply(text) {
		const t = text.toLowerCase();
		let advice = [];
		if (/(fever|temperature|hot)/.test(t)) advice.push('Monitor temperature every 6-8 hours and stay hydrated.');
		if (/(cough|cold|breath|chest)/.test(t)) advice.push('Avoid dust/smoke and consider warm fluids.');
		if (/(headache|migraine|head)/.test(t)) advice.push('Rest in a quiet, dark room and drink water.');
		if (/(nausea|vomit|stomach|diarrhea)/.test(t)) advice.push('Small sips of ORS and avoid solid food for a few hours.');
		if (/(pain|ache)/.test(t)) advice.push('Gentle rest and avoid strain on the affected area.');
		const emergencyHit = (window.RuralCareConfig && RuralCareConfig.ai.emergencyKeywords || []).some(k => t.includes(k));
		const header = 'This is general information and not a medical diagnosis.';
		const emergency = emergencyHit ? 'If this is severe or worsening, please call emergency services immediately.' : 'If symptoms persist or worsen, consult a healthcare provider.';
		const merged = advice.length ? advice.join(' ') : 'Please provide more details: duration, severity, and any other symptoms.';
		return `${header} ${merged} ${emergency}`;
	}

	// Utility Functions
	showNotification(message, type = 'info') {
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.textContent = message;
		
		// Style the notification
		Object.assign(notification.style, {
			position: 'fixed',
			top: '20px',
			right: '20px',
			padding: '12px 20px',
			borderRadius: '5px',
			color: 'white',
			fontWeight: '500',
			zIndex: '10000',
			maxWidth: '300px',
			wordWrap: 'break-word'
		});

		// Set background color based on type
		const colors = {
			success: '#27ae60',
			error: '#e74c3c',
			info: '#3498db',
			warning: '#f39c12'
		};
		notification.style.backgroundColor = colors[type] || colors.info;

		// Add to page
		document.body.appendChild(notification);
		
		// Remove after 3 seconds
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
		}, 3000);
	}

	// Auth
	showLogin() {
		const modal = document.getElementById('loginModal');
		if (modal) modal.style.display = 'flex';
	}

	hideLogin() {
		const modal = document.getElementById('loginModal');
		if (modal) modal.style.display = 'none';
	}

	handleLogin() {
		const email = document.getElementById('loginEmail').value.trim();
		const password = document.getElementById('loginPassword').value;
		if (!email || !password || password.length < 6) {
			this.showNotification(translations[currentLanguage].invalid_credentials || 'Invalid credentials', 'error');
			return;
		}
		const token = btoa(email + '|' + Date.now());
		localStorage.setItem('ruralcare_token', token);
		localStorage.setItem('ruralcare_email', email);
		this.isAuthenticated = true;
		this.updateAuthUI();
		this.updateLockState();
		this.showNotification(translations[currentLanguage].login_success || 'Logged in successfully', 'success');
		this.hideLogin();
		// Redirect to dashboard as next page in the flow
		try { window.location.replace('dashboard.html'); } catch (_) { window.location.href = 'dashboard.html'; }
	}

	logout() {
		localStorage.removeItem('ruralcare_token');
		localStorage.removeItem('ruralcare_email');
		this.isAuthenticated = false;
		this.updateAuthUI();
		this.updateLockState();
	}

	updateAuthUI() {
		const loginBtn = document.getElementById('loginBtn');
		const loginCta = document.getElementById('loginCta');
		const logoutBtn = document.getElementById('logoutBtn');
		if (this.isAuthenticated) {
			if (loginBtn) loginBtn.style.display = 'none';
			if (loginCta) loginCta.style.display = 'none';
			if (logoutBtn) logoutBtn.style.display = 'inline-block';
		} else {
			if (loginBtn) loginBtn.style.display = 'inline-block';
			if (loginCta) loginCta.style.display = 'inline-block';
			if (logoutBtn) logoutBtn.style.display = 'none';
		}
	}

	updateLockState() {
		const sections = document.querySelectorAll('.locked');
		sections.forEach(section => {
			if (this.isAuthenticated) {
				section.classList.remove('locked');
			} else {
				section.classList.add('locked');
			}
		});
	}
}

// Global functions for HTML onclick handlers
function startConsultation() {
	app.startVideoCall();
}

function openHealthRecords() {
	document.getElementById('records').scrollIntoView({ behavior: 'smooth' });
}

function addNewRecord() {
	app.addNewRecord();
}

function syncRecords() {
	app.syncRecords();
}

function searchMedicine() {
	app.searchMedicine();
}

function analyzeSymptoms() {
	app.analyzeSymptoms();
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', function() {
	app = new RuralCareApp();
	
	// Display initial pharmacy results
	app.displayPharmacyResults(app.pharmacyData);
	// Routing/auth guard for multi-page flow
	const path = (location.pathname || '').toLowerCase();
	const file = path.split('/').pop() || 'index.html';
	const protectedPages = new Set(['dashboard.html', 'consultation.html', 'records.html', 'pharmacy.html', 'symptoms.html']);

	if (file === '' || file === 'index.html') {
		if (app.isAuthenticated) {
			try { window.location.replace('dashboard.html'); } catch (_) { window.location.href = 'dashboard.html'; }
		}
	} else if (protectedPages.has(file)) {
		if (!app.isAuthenticated) {
			try { window.location.replace('index.html'); } catch (_) { window.location.href = 'index.html'; }
		}
	}
});

// Export for global access
window.app = app;
