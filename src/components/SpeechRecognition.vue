<template>
    <div class="box control is-flex">
        <button v-on:click="onClickStart" class="button is-success is-light" v-bind:class="{'is-active': isRecognitionEnabled}">Recognize speech</button>
        <div class="pl-3 mt-2 block">
            <code v-if="error">{{error}}</code>
            {{text}}
        </div>
    </div>
</template>

<script>
export default {
    name: 'SpeechRecognition',
    props: {
        language: {
            type: String,
            default: 'en-US'
        }
    },
    data() {
        return {
            isMicrophoneEnabled: false,
            isRecognitionEnabled: false,
            sr: null,
            error: '',
            text: ''
        }
    },
    mounted() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.sr = new SpeechRecognition();
        this.sr.lang = this.language;
        this.sr.continuous = true;
        this.sr.interimResults = true;
        this.sr.maxAlternatives = 3;
        this.sr.onstart = this.startHandler;
        this.sr.onerror = this.errorHandler;
        this.sr.onend = this.endHandler;
        this.sr.onresult = this.resultHandler;
        this.sr.stop();
        console.log(this.sr);
    },
    methods: {
        onClickStart() {
            if (!this.isRecognitionEnabled) {
                this.sr.start();
                this.isRecognitionEnabled = true;
            } else {
                this.sr.abort();
                this.isRecognitionEnabled = false;
                this.error = '';
            }
        },
        startHandler(e) {
            console.log('startHandler', e)
        },
        errorHandler(e) {
            console.error(e);
            this.error = 'Recognition error: ' + e.error;
            this.sr.abort();
        },
        endHandler(e) {
            if (!this.isRecognitionEnabled) {
                return;
            }
            console.log('endHandler', e)
            this.sr.start();
            this.isRecognitionEnabled = false;
        },
        resultHandler(result) {
            console.log('resultHandler', result);
        }
    }
}
</script>