const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const firestore = admin.firestore();

// Process uploaded document
exports.processDocument = functions.https.onRequest(async (req, res) => {
    // Verify authentication
    const userToken = req.headers.authorization?.split("Bearer ")[1];
    if (!userToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Verify token and get user
        const decodedToken = await admin.auth().verifyIdToken(userToken);
        const userId = decodedToken.uid;

        const { document_path } = req.body;
        if (!document_path) {
            res.status(400).json({ error: "No document path provided" });
            return;
        }

        // Call AI service to process document
        const response = await axios.post(process.env.AI_SERVICE_URL + "/process_document", {
            document_path,
            user_id: userId
        });

        // Store document reference in Firestore
        await firestore.collection("documents").add({
            userId,
            documentPath: document_path,
            status: "processed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            chunks: response.data.chunks
        });

        res.status(200).json({
            status: "success",
            chunks: response.data.chunks,
            disclaimer: "This system provides educational guidance only, not legal advice."
        });

    } catch (error) {
        console.error("Error processing document:", error);
        res.status(500).json({ 
            error: "Failed to process document",
            disclaimer: "This system provides educational guidance only, not legal advice."
        });
    }
});

// Query document
exports.queryDocument = functions.https.onRequest(async (req, res) => {
    // Verify authentication
    const userToken = req.headers.authorization?.split("Bearer ")[1];
    if (!userToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Verify token
        await admin.auth().verifyIdToken(userToken);

        const { query } = req.body;
        if (!query) {
            res.status(400).json({ error: "No query provided" });
            return;
        }

        // Call AI service for query
        const response = await axios.post(process.env.AI_SERVICE_URL + "/query", {
            query
        });

        res.status(200).json({
            summary: response.data.summary,
            sources: response.data.sources,
            disclaimer: "This system provides educational guidance only, not legal advice."
        });

    } catch (error) {
        console.error("Error querying document:", error);
        res.status(500).json({ 
            error: "Failed to process query",
            disclaimer: "This system provides educational guidance only, not legal advice."
        });
    }
});

// List user's documents
exports.listDocuments = functions.https.onRequest(async (req, res) => {
    // Verify authentication
    const userToken = req.headers.authorization?.split("Bearer ")[1];
    if (!userToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Verify token and get user
        const decodedToken = await admin.auth().verifyIdToken(userToken);
        const userId = decodedToken.uid;

        // Get user's documents from Firestore
        const snapshot = await firestore
            .collection("documents")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({
            documents,
            disclaimer: "This system provides educational guidance only, not legal advice."
        });

    } catch (error) {
        console.error("Error listing documents:", error);
        res.status(500).json({ 
            error: "Failed to list documents",
            disclaimer: "This system provides educational guidance only, not legal advice."
        });
    }
});
