type Point = number[];
type Vector = number[];
type Stroke = Point[];
interface Char {
    strokes: string[];
    medians: Stroke[];
}

function createHanziSvg(
    characterData: Char,
    strokeColor: string,
    outlineColor: string,
) {
    const brushWidth = 150;

    function subtract(a: Point, b: Point): Vector {
        return [a[0] - b[0], a[1] - b[1]];
    }

    function magnitude(v: Vector) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    }

    function normalize(v: Vector) {
        const length = magnitude(v);
        return [v[0] / length, v[1] / length];
    }

    const strokeLengths = characterData.medians.map((points) => {
        var length = 0;
        for (var i = 1; i < points.length; i++) {
            length += magnitude(subtract(points[i], points[i - 1]));
        }
        return length;
    });

    // Extend the first point backwards a bit such that the edge of the
    // brush, not the center of the brush, is first visible
    function extendStart(points: Point[]) {
        const vectorTowardsStart = normalize(
            subtract(points[0], points[1]),
        );
        points[0] = [
            points[0][0] + (vectorTowardsStart[0] * brushWidth) / 2,
            points[0][1] + (vectorTowardsStart[1] * brushWidth) / 2,
        ];
    }
    for (var stroke of characterData.medians) {
        extendStart(stroke);
    }

    var strokeMovements = characterData.medians.map(
        (stroke) =>
            `M${stroke[0][0]},${stroke[0][1]} ` +
            stroke
                .slice(1)
                .map((point) => `L${point[0]},${point[1]}`)
                .join(" "),
    );

    function createSvgElement(elementType: string): SVGElement {
        return document.createElementNS(
            "http://www.w3.org/2000/svg",
            elementType,
        );
    }

    const svg = createSvgElement("svg");
    svg.setAttribute("viewBox", "0 0 1024 1024");

    const mainGrouping = createSvgElement("g");
    mainGrouping.setAttribute(
        "transform",
        "scale(1, -1) translate(0, -900)",
    );
    svg.appendChild(mainGrouping);

    characterData.strokes.forEach((stroke, idx) => {
        const path = createSvgElement("path");
        path.setAttribute("d", stroke);
        path.setAttribute("fill", outlineColor);
        path.id = `stroke-${idx}`;
        mainGrouping.appendChild(path);
    });

    const defs = createSvgElement("defs");
    for (var i = 0; i < characterData.strokes.length; i++) {
        const clipPath = createSvgElement("clipPath");
        clipPath.id = `mask-${i}`;
        defs.appendChild(clipPath);

        const use = createSvgElement("use");
        use.setAttribute("href", `#stroke-${i}`);
        clipPath.appendChild(use);
    }
    mainGrouping.appendChild(defs);

    const drawingGrouping = createSvgElement("g");
    drawingGrouping.setAttribute("opacity", "1");
    mainGrouping.appendChild(drawingGrouping);

    strokeMovements.forEach((strokeMovement, idx) => {
        const path = createSvgElement("path");
        path.setAttribute("d", strokeMovement);
        path.setAttribute("stroke-width", `${brushWidth}`);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "miter");
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("fill", "none");
        path.setAttribute("clip-path", `url(#mask-${idx})`);
        path.setAttribute("pathLength", "1");
        path.setAttribute("stroke-dasharray", "1");
        path.setAttribute("stroke-dashoffset", "1");
        drawingGrouping.appendChild(path);

        const animate = createSvgElement("animate");
        animate.id = `draw${idx}`;
        animate.setAttribute("attributeName", "stroke-dashoffset");
        animate.setAttribute("values", "1;0");
        animate.setAttribute("dur", `${strokeLengths[idx] * 0.35 + 170}ms`);
        animate.setAttribute(
            "begin",
            `${idx == 0 ? "0;fadeOut.end + 10ms" : `draw${idx - 1}.end + 35ms`}`,
        );
        animate.setAttribute("fill", "freeze");
        path.appendChild(animate);

        const set = createSvgElement("set");
        set.setAttribute("attributeName", "stroke-dashoffset");
        set.setAttribute("to", "1");
        set.setAttribute("begin", "fadeOut.end");
        path.appendChild(set);
    });

    const fadeOutAnimate = createSvgElement("animate");
    fadeOutAnimate.id = "fadeOut";
    fadeOutAnimate.setAttribute("attributeName", "opacity");
    fadeOutAnimate.setAttribute("values", "1;0");
    fadeOutAnimate.setAttribute("dur", "500ms");
    fadeOutAnimate.setAttribute(
        "begin",
        `draw${strokeMovements.length - 1}.end + 1400ms`,
    );
    drawingGrouping.appendChild(fadeOutAnimate);
    return svg;
}

const serializer = new XMLSerializer();
document.querySelectorAll("img[data-hanzi]").forEach(async (img) => {
    const elementData = (img as HTMLElement).dataset;
    const hanzi = elementData.hanzi;
    const response = await fetch(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${hanzi}.json`,
        { cache: "force-cache" },
    );
    const charData: Char = await response.json();
    console.log(charData);
    const svg = createHanziSvg(
        charData,
        elementData.strokeColor ?? "black",
        elementData.outlineColor ?? "gray",
    );
    const svgData = encodeURIComponent(serializer.serializeToString(svg));
    img.setAttribute("src", `data:image/svg+xml;charset=utf-8,${svgData}`);
});