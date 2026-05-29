export function medianOfMedians(A) {
    //se for menor que cinco ele termina
    if (A.length <= 5) {
        const sorted = [...A].sort((a, b) => a - b);

        return sorted[Math.floor((sorted.length - 1) / 2)]; //esquerda na mediana
    }

    const medians = [];

    // divide em grupos de 5
    for (let i = 0; i < A.length; i += 5) {
        const group = A.slice(i, i + 5);

        group.sort((a, b) => a - b);

        const medianIndex = Math.floor((group.length - 1) / 2); //esquerda na mediana

        medians.push(group[medianIndex]);
    }

    return medianOfMedians(medians);
}

export function kthselection(A, k) {
    // k começa em 0
    if (A.length === 1) {
        return A[0];
    }

    const pivot = medianOfMedians(A);

    const lows = [];
    const highs = [];
    const pivots = [];

    for (const x of A) {
        if (x < pivot) {
            lows.push(x);
        } else if (x > pivot) {
            highs.push(x);
        } else {
            pivots.push(x);
        }
    }

    if (k < lows.length) {
        return kthselection(lows, k);
    }

    if (k < lows.length + pivots.length) {
        return pivot;
    }

    return kthselection(
        highs,
        k - lows.length - pivots.length
    );
}