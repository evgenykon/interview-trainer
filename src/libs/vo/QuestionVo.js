export default class QuestionVo {
    text;
    isStarting;
    isEnding;
    constructor(text, isStarting, isEnding) {
        this.text = text;
        this.isStarting = isStarting;
        this.isEnding = isEnding;
    }
}