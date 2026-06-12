const selfieInput = document.getElementById('selfieInput');
const status = document.getElementById('status');
const gallery = document.getElementById('gallery');

// 1. Tomar uploaded group photo gulor list ekhane likhbe
const groupPhotos = [
    'photos/group1.jpg', 
    'photos/group2.jpg', 
    'photos/group3.jpg'
];

// 2. AI Models load kora (Online CDN theke load hobe)
async function loadModels() {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    status.innerText = "AI Models Ready! Apnar selfie upload korun.";
}

// 3. Main process suru hobe selfie upload korle
selfieInput.addEventListener('change', async () => {
    if (selfieInput.files.length === 0) return;
    
    gallery.innerHTML = ''; // Purono result clear korbe
    status.innerText = "Analyzing your selfie... 🕵️‍♂️";

    // User-er selfie theke face descriptor ber kora
    const selfieFile = selfieInput.files[0];
    const selfieImage = await faceapi.bufferToImage(selfieFile);
    const selfieDetection = await faceapi.detectSingleFace(selfieImage).withFaceLandmarks().withFaceDescriptor();

    if (!selfieDetection) {
        status.innerText = "Selfie-te kono mukh khunje pauya jayni! Abar chesta korun.";
        return;
    }

    const faceMatcher = new faceapi.FaceMatcher(selfieDetection.descriptor, 0.6); // 0.6 mane 60% match holei hobe
    status.innerText = "Searching your face in group photos... 🔍";

    // Sobaar chhobi scan kora
    for (const photoUrl of groupPhotos) {
        try {
            const img = await faceapi.fetchImage(photoUrl);
            const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

            for (const detection of detections) {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                if (match.label !== 'unknown') {
                    // Match khunje পেলে gallery-te add korbe
                    const matchedImg = document.createElement('img');
                    matchedImg.src = photoUrl;
                    gallery.appendChild(matchedImg);
                    break; // Ekta photo-te ekbar match holei hobe
                }
            }
        } catch (err) {
            console.error("Error processing " + photoUrl, err);
        }
    }

    if (gallery.children.length === 0) {
        status.innerText = "Dukkhojonok bhabe kono photo-te apnake khunje pauya jayni! 😢";
    } else {
        status.innerText = `Apnar ${gallery.children.length} ti photo khunje pauya gachhe! 🎉`;
    }
});

// Start the app
loadModels();

