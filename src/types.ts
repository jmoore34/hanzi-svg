type Point = number[];
type Vector = number[];
type Stroke = Point[];
interface CharacterData {
    strokes: string[];
    medians: Stroke[];
}