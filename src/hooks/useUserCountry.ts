import { useState, useEffect } from "react";

/**
 * Fetches the user's current country code (ISO 3166-1 alpha-2) using a free IP API.
 */
export function useUserCountry() {
  const [countryId, setCountryId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to fetch from ipapi.co
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          setCountryId(data.country_code);
        }
      })
      .catch(() => {
        // Fallback to another free API if the first fails
        fetch("https://ipwho.is/")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.country_code) {
              setCountryId(data.country_code);
            }
          })
          .catch((err) => {
            console.error("Failed to detect user country", err);
          });
      });
  }, []);

  return countryId;
}
