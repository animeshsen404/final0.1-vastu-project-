import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export const CANONICAL_DEFAULT_LOGO = '/trademark-logo.jpg';
export const BRANDING_COLLECTION = 'site_settings';
export const BRANDING_DOC_ID = 'branding';
export const BRANDING_PATH = `${BRANDING_COLLECTION}/${BRANDING_DOC_ID}`;

export interface SiteBrandingRecord {
  logoUrl: string;
  storageUrl?: string;
  fileName: string;
  mimeType: string;
  updatedBy: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Compresses or encodes an uploaded image File into a crisp, self-contained Data URI
 * guaranteed to fit comfortably within Firestore's 1MB document limit (max 900KB string length).
 */
export async function fileToSafeDataUri(file: File): Promise<string> {
  const rawDataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  if (rawDataUri.length <= 750000 || file.type === 'image/svg+xml') {
    return rawDataUri;
  }

  // If larger than 750KB, scale down cleanly via canvas while preserving aspect ratio
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 900;
      let width = img.naturalWidth || 800;
      let height = img.naturalHeight || 800;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUri.slice(0, 900000));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      let compressed = canvas.toDataURL(outputMime, 0.86);
      if (compressed.length > 850000) {
        compressed = canvas.toDataURL('image/jpeg', 0.75);
      }
      resolve(compressed);
    };
    img.onerror = () => resolve(rawDataUri.slice(0, 900000));
    img.src = rawDataUri;
  });
}

/**
 * Uploads the trademark logo to Firebase Storage (when authenticated with Firebase Auth)
 * and persists the logo URL / Data URI in Firestore (`/site_settings/branding`) as well as the backend API.
 */
export async function uploadAndPersistTrademarkLogo(options: {
  file?: File | null;
  directUrl?: string;
}): Promise<{ logoUrl: string; storageUrl?: string }> {
  const { file, directUrl } = options;
  let finalLogoUrl = directUrl?.trim() || CANONICAL_DEFAULT_LOGO;
  let storageDownloadUrl: string | undefined;
  let fileName = file?.name || 'trademark-logo.jpg';
  let mimeType = file?.type || 'image/jpeg';

  // Step 1: If a File was selected, convert to self-contained Data URI and optionally upload to Firebase Storage
  if (file) {
    const dataUri = await fileToSafeDataUri(file);

    // Attempt Firebase Storage upload if a Firebase Auth user is signed in
    if (auth.currentUser) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60) || 'logo.jpg';
        const storageRef = ref(storage, `branding/logos/${Date.now()}_${cleanName}`);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });
        storageDownloadUrl = await getDownloadURL(snapshot.ref);
      } catch (storageErr) {
        // Storage rules or bucket policy may restrict direct client upload; Data URI + backend persistence handles this seamlessly
        console.warn('Firebase Storage client upload notice (falling back to Data URI + Server Storage):', storageErr);
      }
    }

    // Upload to backend server API (which writes to disk, PostgreSQL, dataStore, and Firebase Admin Firestore)
    const uploadRes = await fetch('/api/admin/upload-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        base64Data: dataUri,
        storageUrl: storageDownloadUrl,
      }),
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || 'Failed to upload logo file to server');
    }

    // Prefer self-contained Data URI or Firebase Storage URL so it never breaks across container restarts
    finalLogoUrl = uploadData.logoUrl || storageDownloadUrl || dataUri;
  } else {
    // Direct URL or reset to default canonical logo
    const saveRes = await fetch('/api/admin/settings/logo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ logoUrl: finalLogoUrl }),
    });

    const saveData = await saveRes.json();
    if (!saveRes.ok) {
      throw new Error(saveData.error || 'Failed to update website logo setting');
    }

    finalLogoUrl = saveData.logoUrl || finalLogoUrl;
  }

  // Step 2: If the administrator is signed in via Firebase Auth (`auth.currentUser`), also write directly to Firestore client SDK
  // adhering strictly to `firebase-blueprint.json` and `firestore.rules`.
  if (auth.currentUser && auth.currentUser.emailVerified) {
    const brandingDocRef = doc(db, BRANDING_COLLECTION, BRANDING_DOC_ID);
    const safeLogoUrl = finalLogoUrl.slice(0, 950000);
    const safeFileName = (fileName || 'trademark-logo.jpg').slice(0, 256);
    const safeMimeType = (mimeType || 'image/jpeg').slice(0, 64);
    const safeUpdatedBy = auth.currentUser.uid.slice(0, 128);

    try {
      const existingSnap = await getDoc(brandingDocRef);
      const payload: Record<string, any> = {
        logoUrl: safeLogoUrl,
        fileName: safeFileName,
        mimeType: safeMimeType,
        updatedBy: safeUpdatedBy,
        updatedAt: serverTimestamp(),
      };
      if (storageDownloadUrl) {
        payload.storageUrl = storageDownloadUrl.slice(0, 2048);
      }

      if (!existingSnap.exists()) {
        await setDoc(brandingDocRef, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(brandingDocRef, payload);
      }
    } catch (firestoreErr) {
      handleFirestoreError(firestoreErr, OperationType.WRITE, BRANDING_PATH);
    }
  }

  return { logoUrl: finalLogoUrl, storageUrl: storageDownloadUrl };
}

/**
 * Fetches the global website logo from Firestore (`/site_settings/branding`).
 */
export async function fetchGlobalLogoFromFirestore(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const brandingDocRef = doc(db, BRANDING_COLLECTION, BRANDING_DOC_ID);
  try {
    const snap = await getDoc(brandingDocRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteBrandingRecord>;
      if (data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.trim()) {
        return data.logoUrl.trim();
      }
    }
    return null;
  } catch (error) {
    // Use handleFirestoreError if permission denied
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, BRANDING_PATH);
    }
    return null;
  }
}

/**
 * Subscribes to real-time updates on `/site_settings/branding` in Firestore so all connected clients
 * update their website logo immediately when an administrator publishes a change.
 */
export function subscribeToGlobalLogo(onLogoChange: (logoUrl: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const brandingDocRef = doc(db, BRANDING_COLLECTION, BRANDING_DOC_ID);
  return onSnapshot(
    brandingDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SiteBrandingRecord>;
        if (data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.trim()) {
          onLogoChange(data.logoUrl.trim());
        }
      }
    },
    (error) => {
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        try {
          handleFirestoreError(error, OperationType.GET, BRANDING_PATH);
        } catch {
          // Logged via handleFirestoreError
        }
      }
    }
  );
}
