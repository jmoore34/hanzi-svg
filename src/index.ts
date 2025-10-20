import { createHanziSvg } from "./createSvg";

const serializer = new XMLSerializer();
document.querySelectorAll("img[data-hanzi]").forEach(async (img) => {
    const elementData = (img as HTMLElement).dataset;
    const hanzi = elementData.hanzi;
    const response = await fetch(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${hanzi}.json`,
        { cache: "force-cache" },
    );
    const charData: CharacterData = await response.json();
    const svg = createHanziSvg(
        charData,
        elementData.strokeColor ?? "black",
        elementData.outlineColor ?? "gray",
    );
    const svgData = encodeURIComponent(serializer.serializeToString(svg));
    img.setAttribute("src", `data:image/svg+xml;charset=utf-8,${svgData}`);
});