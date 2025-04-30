// src/components/GoogleAuth.jsx
import React, { useEffect } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar";

function GoogleAuth({ setAccessToken }) {
  useEffect(() => {
    const initializeGapi = () => {
      window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          console.log("✅ Token received:", tokenResponse);
          setAccessToken(tokenResponse.access_token);

          // Explicitly load the Calendar API
          window.gapi.load("client", () => {
            window.gapi.client.load("calendar", "v3", () => {
              console.log("✅ Google Calendar API loaded");
            });
          });
        },
      }).requestAccessToken();
    };

    if (window.google?.accounts?.oauth2) {
      initializeGapi();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = initializeGapi;
      document.body.appendChild(script);
    }

    if (!window.gapi) {
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () => console.log("✅ GAPI script loaded");
      document.body.appendChild(gapiScript);
    }
  }, [setAccessToken]);

  return null;
}

export default GoogleAuth;
