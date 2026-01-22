// src/lib/argocd.js

// Cache token in memory to avoid frequent logins
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Mendapatkan Authentication Token dari ArgoCD
 */
async function getAuthToken() {
  const now = Date.now();
  
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const baseUrl = process.env.ARGOCD_URL?.replace(/\/$/, '');
  const password = process.env.ARGOCD_ADMIN_PASSWORD;
  const username = process.env.ARGOCD_USERNAME || 'admin';

  if (!baseUrl || !password) {
    console.error("[ArgoCD] Missing configuration");
    return null;
  }

  try {
    console.log(`[ArgoCD] Attempting login to ${baseUrl}...`);
    const res = await fetch(`${baseUrl}/api/v1/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(10000), 
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[ArgoCD] Auth failed (${res.status}): ${errBody}`);
      return null;
    }

    const data = await res.json();
    cachedToken = data.token;
    tokenExpiry = now + (60 * 60 * 1000); 
    console.log("[ArgoCD] Login successful, token cached.");
    return cachedToken;
  } catch (error) {
    console.error("[ArgoCD] Connection Error:", error.message);
    return null;
  }
}

/**
 * Mengambil Status Aplikasi dari ArgoCD
 * @param {string} appName Nama aplikasi di ArgoCD (misal: myapp-prod)
 */
export async function getArgoAppStatus(appName) {
  const token = await getAuthToken();
  const baseUrl = process.env.ARGOCD_URL?.replace(/\/$/, '');

  if (!token) return { error: "Authentication failed. Check logs." };

  try {
    const res = await fetch(`${baseUrl}/api/v1/applications/${appName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (res.status === 404) {
      return { status: 'NotFound', error: `Application ${appName} not found in ArgoCD` };
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ArgoCD API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    
    return {
      health: data.status?.health?.status || 'Unknown',
      sync: data.status?.sync?.status || 'Unknown',
      operation: data.status?.operationState?.phase || null,
      conditions: data.status?.conditions || []
    };

  } catch (error) {
    console.error(`[ArgoCD] Fetch Error for ${appName}:`, error.message);
    return { error: error.message };
  }
}
