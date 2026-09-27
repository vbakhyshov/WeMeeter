// Haversine, calc distance
export const calculateDistanceKm = (coord1, coord2) => {
    if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return null;

    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371; // earth radius
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
};

// city from location
export const extractCity = (addressStr) => {
    if (!addressStr || typeof addressStr !== 'string') return "Ulm";

    const parts = addressStr.split(',').map(p => p.trim());
    if (parts.length === 1) return parts[0];

    // dummy thing
    const blacklistRegex = /^(germany|deutschland|baden-württemberg|bayern|bavaria|\d{4,5}|studentenwohnheim|wohnheim|campus|hochschule|universität|uni|innenstadt|stadtmitte|oststadt|weststadt|nordstadt|mitte)$/i;

    // city is in the end
    for (let i = parts.length - 1; i >= 0; i--) {
        const item = parts[i];

        // ignore post index
        if (/^\d+$/.test(item) || /\b\d{5}\b/.test(item)) continue;

        // ignore street
        if (/straße|str\b|str\.|weg|platz|gasse|allee|road|street|avenue/i.test(item)) continue;

        // ignore dummy thing
        if (blacklistRegex.test(item)) continue;

        return item;
    }

    return parts[0] || "Ulm";
};