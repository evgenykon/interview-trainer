<template>
    <div class="card">
        <div class="card-content">
            <div class="content columns">
                <div class="column">
                    <div class="field">
                        <label class="label">Voices</label>
                        <div class="control">
                            <div class="select">
                            <select v-model="voice">
                                <option v-for="voice in status.voices" v-bind:value="voice">{{voice.name}}</option>
                            </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column  is-one-fifth">
                    <div class="field">
                        <label class="label">Speed</label>
                        <div class="control">
                            <div class="select">
                            <select v-model="speed">
                                <option v-bind:value="0.5">0.5</option>
                                <option v-bind:value="1">1</option>
                                <option v-bind:value="3">3</option>
                                <option v-bind:value="5">5</option>
                                <option v-bind:value="10">10</option>
                            </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column is-one-fifth">
                    <div class="field" v-if="answerTimeoutPercent > 0">
                        <label class="label">Answer timeout</label>
                        <div class="control">
                            <progress class="progress mt-4 is-danger" v-bind:value="answerTimeoutPercent" max="100">{{answerTimeoutPercent}}%</progress>
                        </div>
                    </div>
                </div>
                <div class="column is-flex is-justify-content-flex-end">
                    <div class="field">
                        <label class="label">Controls</label>
                        <div class="control">
                            <button class="button is-primary" v-bind:disabled="isReading" v-on:click="onClickStart()">Start</button>
                            <!-- button class="button is-outlined ml-1" v-bind:disabled="!isReading">Pause</button>
                            <button class="button is-danger is-outlined ml-1" v-bind:disabled="!isStarted">Abort</button -->
                        </div>
                    </div>

                </div>

                
            </div>
        </div>
    </div>
</template>

<script>

import EasySpeech from 'easy-speech';
import { get, set } from 'idb-keyval';

export default {
    name: 'SpeechPlayer',
    props: {
        text: {
            type: String
        },
        isStarted: {
            type: Boolean,
            default: false
        },
        answerTimeoutPercent: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            status: [],
            voice: null,
            speed: 1,
            isReading: false
        }

    },
	async mounted() {
        await EasySpeech.init({ maxTimeout: 5000, interval: 250 });
        this.status = await EasySpeech.status()
        this.voice = this.status.voices[0];
        await this.loadLastVoiceParams();
    },
    methods: {
        async onClickStart() {
            this.$emit('started');
            this.storeVoiceParams();
        },
        onEnd() {
            console.log('text-readed', this);
            this.$emit('text-readed');
            this.isReading = false;
        },
        async storeVoiceParams() {
            try {
                await set('voice-params', JSON.stringify({
                    voice: this.voice.voiceURI,
                    speed: this.speed
                }));
            } catch (e) {
                console.error('Fail to store voice params', e);
            }
        },
        async loadLastVoiceParams() {
            try {
                const data = await get('voice-params');
                if (data) {
                    const params = JSON.parse(data);
                    this.speed = params.speed;
                    const voices = await EasySpeech.status();
                    for (let voice of voices.voices) {
                        if (voice.voiceURI !== params.voice) {
                            continue;
                        }
                        this.voice = voice;
                        break;
                    }
                }
            } catch (e) {
                console.error('Fail to load voice params', e);
            }
        }
    },
    watch: {
        async text(val) {
            if (!val) {
                return;
            }
            if (this.isReading) {
                return;
            }
            this.isReading = true;
            await EasySpeech.speak({
                text: val,
                voice: this.voice,
                rate: this.speed,
                end: this.onEnd
            })
        }
    }
};
</script>
