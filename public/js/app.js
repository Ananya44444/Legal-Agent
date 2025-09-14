/* Initialize Firebase with your config */
const firebaseConfig = {
    // Your Firebase config object will go here
    // Get this from Firebase Console > Project Settings > Your Apps
};

firebase.initializeApp(firebaseConfig);

// Auth instance
const auth = firebase.auth();
// Storage instance
const storage = firebase.storage();

// DOM Elements
const loginSection = document.getElementById('loginSection');
const uploadSection = document.getElementById('uploadSection');
const documentListSection = document.getElementById('documentListSection');
const querySection = document.getElementById('querySection');
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const queryForm = document.getElementById('queryForm');
const documentList = document.getElementById('documentList');
const summary = document.getElementById('summary');
const sources = document.getElementById('sources');

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        documentListSection.classList.remove('hidden');
        querySection.classList.remove('hidden');
        loadDocuments();
    } else {
        // User is signed out
        loginSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        documentListSection.classList.add('hidden');
        querySection.classList.add('hidden');
    }
});

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginForm.reset();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Upload handler
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('documentInput').files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    if (!file.name.endsWith('.pdf')) {
        alert('Only PDF files are supported');
        return;
    }
    
    try {
        // Show progress
        document.getElementById('uploadProgress').classList.remove('hidden');
        
        // Upload to Firebase Storage
        const storageRef = storage.ref(`documents/${auth.currentUser.uid}/${file.name}`);
        const uploadTask = storageRef.put(file);
        
        // Monitor upload progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.querySelector('#uploadProgress progress').value = progress;
            },
            (error) => {
                alert('Upload failed: ' + error.message);
                document.getElementById('uploadProgress').classList.add('hidden');
            },
            async () => {
                // Upload completed successfully
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                // Process document with our backend
                const idToken = await auth.currentUser.getIdToken();
                const response = await fetch('/processDocument', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        document_path: downloadURL
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to process document');
                }
                
                document.getElementById('uploadProgress').classList.add('hidden');
                uploadForm.reset();
                loadDocuments();
            }
        );
    } catch (error) {
        alert('Upload failed: ' + error.message);
        document.getElementById('uploadProgress').classList.add('hidden');
    }
});

// Query handler
queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('queryInput').value;
    
    try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('/queryDocument', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error('Query failed');
        }
        
        const result = await response.json();
        
        // Display results
        document.getElementById('queryResult').classList.remove('hidden');
        summary.textContent = result.summary;
        
        // Display sources with page numbers
        sources.innerHTML = result.sources.map(source => 
            `<div class="source">Page ${source.page}</div>`
        ).join('');
        
    } catch (error) {
        alert('Query failed: ' + error.message);
    }
});

// Load user's documents
async function loadDocuments() {
    try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('/listDocuments', {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load documents');
        }
        
        const data = await response.json();
        
        // Display documents
        documentList.innerHTML = data.documents.map(doc => `
            <div class="document">
                <div class="document-name">${doc.documentPath.split('/').pop()}</div>
                <div class="document-date">${new Date(doc.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');
        
    } catch (error) {
        alert('Failed to load documents: ' + error.message);
    }
}
