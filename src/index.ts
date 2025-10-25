import { getCharacterData as getCharacterData } from "./characterCache";
import { createHanziSvg } from "./createSvg";

const serializer = new XMLSerializer();

document.querySelectorAll("img[data-hanzi]").forEach(async (img) => {
    const element = img as HTMLElement;
    const elementData = element.dataset;
    const hanzi = elementData.hanzi;
    if (!hanzi) {
        return;
    }
    const originalOpacity = element.style.opacity;
    element.style.opacity = '0';
    setTimeout(() => {
        element.style.opacity = originalOpacity
    }, parseInt(elementData.timeout ?? '') || 200)
    const charData: CharacterData = await getCharacterData(hanzi);
    const svg = createHanziSvg(
        charData,
        elementData.strokeColor ?? "black",
        elementData.outlineColor ?? "gray",
    );
    const svgData = encodeURIComponent(serializer.serializeToString(svg));
    img.setAttribute("src", `data:image/svg+xml;charset=utf-8,${svgData}`);
    element.style.opacity = originalOpacity;
});