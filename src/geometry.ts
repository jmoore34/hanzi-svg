export function subtract(a: Point, b: Point): Vector {
    return [a[0] - b[0], a[1] - b[1]];
}

export function magnitude(v: Vector) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function normalize(v: Vector) {
    const length = magnitude(v);
    return [v[0] / length, v[1] / length];
}