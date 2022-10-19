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
                <div class="column">
                    <div class="field">
                        <label class="label">Speed</label>
                        <div class="control">
                            <div class="select">
                            <select v-model="speed">
                                <option v-bind:value="1">1</option>
                                <option v-bind:value="2">2</option>
                                <option v-bind:value="3">3</option>
                                <option v-bind:value="4">4</option>
                                <option v-bind:value="5">5</option>
                            </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="field">
                        <label class="label">Controls</label>
                        <div class="control">
                            <button class="button is-primary" v-on:click="onClickStart()">Start</button>
                            <button class="button is-outlined">Pause</button>
                            <button class="button is-danger is-outlined">Abort</button>
                        </div>
                    </div>

                </div>

                
            </div>
        </div>
    </div>
</template>

<script>

import EasySpeech from 'easy-speech'

export default {
    name: 'SpeechPlayer',
    props: {
        text: {
            type: String
        }
    },
    data() {
        return {
            status: [],
            voice: null,
            speed: 1
        }

    },
	async mounted() {
        console.log('x mounted', EasySpeech.detect());
        await EasySpeech.init({ maxTimeout: 5000, interval: 250 })
            .then(() => console.debug('load complete'))
            .catch(e => console.error(e))
        this.status = await EasySpeech.status()
        this.voice = this.status.voices[0];
    },
    methods: {
        async onClickStart() {
            await EasySpeech.speak({
                text: this.text,
                voice: this.voice,
                rate: this.speed,
                boundary: e => console.debug('boundary reached')
            })
        }
    }
};
</script>
