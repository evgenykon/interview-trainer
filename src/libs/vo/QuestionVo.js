export default class QuestionVo {
    text;
    isStarting;
    isEnding;
    answerTimeout;
    constructor(text, isStarting, isEnding, answerTimeout) {
        this.text = text;
        this.isStarting = isStarting;
        this.isEnding = isEnding;
        this.answerTimeout = answerTimeout ?? 5;
    }
}