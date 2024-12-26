

export interface Period {
    start: string;
    end: string;
}

export function convertDate(dataString: string) {
    if (dataString) {
        const partes = dataString.split('/');
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Os meses em JavaScript vão de 0 a 11
        const ano = parseInt(partes[2], 10);
        return `${ano}-${mes}-${dia}`
    }
}

export function appendDatePeriod(url: string, period: Period) {
    const startConverted = convertDate(period.start)
    const endConverted = convertDate(period.end)
    
    let initialCharacter = url.includes("?") ?"&": "?";
    
    if (startConverted) {
        
        url += `${initialCharacter}dateFrom=${startConverted}`
        if (endConverted) {
            url += `&dateTo=${endConverted}`
        }
    } else {
        if (endConverted) {
            url += `${initialCharacter}dateTo=${endConverted}`
        }
    }

    return url
}