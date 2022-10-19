<template>

    <div>
        <h2 class="is-size-2 mb-2" v-if="!isStarted">Composing</h2>

        <div class="card mb-5" v-if="!isStarted">
            <div class="card-content">
                <div class="content columns">
                    <div class="column is-three-quarters">
                        <textarea v-if="question" class="textarea" rows="10" v-model="question.text"></textarea>
                        <div class="control mt-1" v-if="question">
                            <label class="radio">
                                <input type="radio" name="position" value="starting" v-model="position" v-bind:disabled="hasStartQuestion">
                                Starting question
                            </label>
                            <label class="radio">
                                <input type="radio" name="position" value="ending" v-model="position" v-bind:disabled="hasEndQuestion">
                                Finishing question
                            </label>
                        </div>
                        <div class="control mt-3" v-if="question">
                            <button class="button is-small is-primary is-rounded is-outlined" v-on:click="submitQuestion()">Submit</button>
                            <button class="button is-small is-danger is-rounded is-outlined" v-on:click="deleteQuestion()">Delete</button>
                        </div>
                    </div>
                    <div class="column">
                        <nav class="panel">
                            <div class="panel-block">
                                <button class="button is-link is-outlined" v-on:click="addQuestion()">
                                    New question
                                </button>
                            </div>
                            <a class="panel-block is-active" v-for="(q,i) of interview" v-on:click="selectQuestion(q,i)">
                                <span class="tag is-primary is-light" v-if="q.isStarting">start</span>&nbsp; 
                                <span class="tag is-danger is-light" v-else-if="q.isEnding">end</span>&nbsp; 
                                <span class="tag is-light" v-else>rand</span>&nbsp; 
                                {{substr15(q.text)}}
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="is-size-2 mb-2">Testing</h2>

        <SpeechPlayer  client:visible v-bind:text="speechText" v-on:started="onInterviewStarted" v-on:text-readed="onTextReaded" />
    </div>


</template>

<script>
import QuestionVo from '../libs/vo/QuestionVo.js';
import SpeechPlayer from './SpeechPlayer.vue';
export default {
    name: 'Composer',
    components: {
        SpeechPlayer
    },
    data() {
        return {
            interview: [],
            question: null,
            position: 'rand',
            questionIndex: null,
            isStarted: false,
            readingIndex: null,
        }
    },
    methods: {
        addQuestion() {
            this.question = new QuestionVo();
            this.position = 'rand';
        },
        substr15(value) {
            if (!value) return '';
            if (value.length < 15) return value;
            return value.toString().substr(0, 15) + '...';
        },
        submitQuestion() {
            if (this.questionIndex === null) {
                this.interview.push(this.question);
            } else {
                this.interview[this.questionIndex] = this.question;
            }
            this.question = null;
        },
        selectQuestion(q,i) {
            this.question = q;
            this.questionIndex = i;
            this.position = this.question.isStarting ? 'starting' : (this.question.isEnding ? 'ending' : 'rand');
        },
        deleteQuestion() {
            if (this.questionIndex === null) {
                return;
            }
            this.interview.splice(this.questionIndex, 1);
            this.questionIndex = null;
            this.question = null;
        },
        onInterviewStarted() {
            if (this.interview.length < 1) {
                return;
            }
            let sortedInterview = [];
            const firstQ = this.interview.filter(q => q.isStarting);
            const endQ = this.interview.filter(q => q.isEnding);
            const randQ = this.interview.filter(q => !q.isStarting && !q.isEnding).sort(() => Math.random() - 0.5);
            this.interview = [].concat(firstQ, randQ, endQ);
            this.readingIndex = 0;
        },
        onTextReaded() {
            console.log('onTextReaded');
            if (this.readingIndex < this.interview.length - 1) {
                this.readingIndex++;
            } else {
                this.readingIndex = null;
            }
        }
    },
    watch: {
        position(val) {
            if (val === 'starting') {
                this.question.isStarting = true;
                this.question.isEnding = false;
            } else if (val === 'ending') {
                this.question.isStarting = false;
                this.question.isEnding = true;
            } else {
                this.question.isStarting = false;
                this.question.isEnding = false;
            }
        }
    },
    computed: {
        speechText() {
            return this.readingIndex === null ? '' : this.interview[this.readingIndex].text;
        },
        hasStartQuestion() {
            return this.interview.filter(q => q.isStarting).length > 0;
        },
        hasEndQuestion() {
            return this.interview.filter(q => q.isEnding).length > 0;
        }
    }
};
</script>
