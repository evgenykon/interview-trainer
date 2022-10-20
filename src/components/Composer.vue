<template>

    <div>
        <h2 class="is-size-2 mb-2" v-if="!isStarted">Composing</h2>

        <div class="card mb-5" v-if="!isStarted">
            <div class="card-content">
                <div class="content columns">
                    <div class="column is-three-quarters">
                        <textarea v-if="question" class="textarea" rows="10" v-model="question.text"></textarea>
                        <div class="columns mt-1 mb-0" v-if="question">
                            <div class="column">
                                <div class="control">
                                    <label class="radio">
                                        <input type="radio" name="position" value="starting" v-model="position" v-bind:disabled="hasStartQuestion">
                                        Starting question
                                    </label>
                                    <label class="radio">
                                        <input type="radio" name="position" value="ending" v-model="position" v-bind:disabled="hasEndQuestion">
                                        Finishing question
                                    </label>
                                </div>
                            </div>
                            <div class="column">
                                <div class="control">
                                    <label class="radio pt-1 pr-1">
                                        Answer time {{question.answerTimeout}} sec
                                        <input class="mt-1" type="range" v-model="question.answerTimeout" min="5" max="180" style="height:10px;" /> 
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="control mt-1" v-if="question">
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
                                
                                <button class="button is-primary is-outlined ml-1" v-on:click="storeLastTraining()">Save</button>

                                <button class="button is-outlined ml-1" v-on:click="loadDemoInterview()">Demo</button>
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

        <SpeechPlayer  
            client:visible 
            v-bind:text="speechText" 
            v-bind:is-started="isStarted"
            v-bind:answer-timeout-percent="answerTimeoutPercent"
            v-on:started="onInterviewStarted" 
            v-on:text-readed="onTextReaded" 
        />
    </div>


</template>

<script>
import QuestionVo from '../libs/vo/QuestionVo.js';
import SpeechPlayer from './SpeechPlayer.vue';
import { get, set } from 'idb-keyval';
import {mixin as VueTimers} from 'vue-timers';

export default {
    name: 'Composer',
    components: {
        SpeechPlayer
    },
    mixins: [VueTimers],
    data() {
        return {
            interview: [],
            question: null,
            position: 'rand',
            questionIndex: null,
            isStarted: false,
            readingIndex: null,
            answerTimeoutSecondsCounter: 0
        }
    },
    mounted() {
        this.loadLastTraining();
    },
    timers: {
        answerTimeout: { time: 5000, autostart: false },
        answerTimeoutCheckPercent: {time: 1000, repeat: true}
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
            this.isStarted = true;
            let sortedInterview = [];
            const firstQ = this.interview.filter(q => q.isStarting);
            const endQ = this.interview.filter(q => q.isEnding);
            const randQ = this.interview.filter(q => !q.isStarting && !q.isEnding).sort(() => Math.random() - 0.5);
            this.interview = [].concat(firstQ, randQ, endQ);
            this.readingIndex = 0;

        },
        onTextReaded() {
            if (this.readingIndex < this.interview.length - 1) {
                this.timers.answerTimeout.time = this.interview[this.readingIndex].answerTimeout * 1000;
            }
            this.$timer.start('answerTimeout');
            this.$timer.start('answerTimeoutCheckPercent');
        },
        answerTimeout() {
            this.$timer.stop('answerTimeoutCheckPercent');
            this.answerTimeoutSecondsCounter = 0;
            if (this.readingIndex < this.interview.length - 1) {
                this.readingIndex++;
            } else {
                this.readingIndex = null;
                this.isStarted = false;
            }
        },
        answerTimeoutCheckPercent() {
            console.log('answerTimeoutCheckPercent ++');
            this.answerTimeoutSecondsCounter++;
        },
        async loadLastTraining() {
            try {
                const training = await get('last-training');
                if (training) {
                    this.interview = JSON.parse(training);
                }
            } catch (e) {
                console.log('No trainings stored');
            }
        },
        async storeLastTraining() {
            try {
                await set('last-training', JSON.stringify(this.interview));
                console.log(JSON.stringify(this.interview));
            } catch (e) {
                console.error('Fail to store training', e);
            }
        },
        async loadDemoInterview() {
            const data = await fetch('/demo/demo1.json');
            this.interview = await data.json();
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
        },
        answerTimeoutPercent() {
            if (this.interview.length > 0 && this.readingIndex !== null && this.interview[this.readingIndex].answerTimeout > 0) {
                return Math.ceil(this.answerTimeoutSecondsCounter * 100 / this.interview[this.readingIndex].answerTimeout);
            } else {
                return 0;
            }
        }
    }
};
</script>

<!-- style src="@vueform/slider/themes/default.css"></style -->
