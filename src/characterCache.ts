import IndexedStorage from "@amitkhare/indexed-storage";

const characterDoesNotExist = "";

export async function getCharacterData(hanzi: string): Promise<CharacterData> {
    try {
        const data = await IndexedStorage.getItem(hanzi)
        if (data == characterDoesNotExist) {
            throw "character does not exist";
        }
        if (data) {
            return data;
        } else {
            return downloadCharacter(hanzi);
        }
    } catch {
        return downloadCharacter(hanzi);
    }

}

async function downloadCharacter(hanzi: string): Promise<CharacterData> {
    console.log(`Cache miss for character ${hanzi}`);
    const response = await fetch(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${hanzi}.json`,
        { cache: "force-cache" },
    );
    if (response.status == 404) {
        IndexedStorage.setItem(hanzi, characterDoesNotExist);
        throw "character does not exist";
    }
    const json = await response.json();
    IndexedStorage.setItem(hanzi, json);
    return json;
}