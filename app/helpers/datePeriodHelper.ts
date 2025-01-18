

export interface Period {
    start: string;
    end: string;
}

export function appendDatePeriod(url: string, period: Period) {
    let initialCharacter = url.includes("?") ?"&": "?";
    
    if (period?.start) {
        
        url += `${initialCharacter}dateFrom=${period?.start}`
        if (period?.end) {
            url += `&dateTo=${period?.end}`
        }
    } else {
        if (period?.end) {
            url += `${initialCharacter}dateTo=${period?.end}`
        }
    }

    return url
}