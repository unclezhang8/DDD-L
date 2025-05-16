import Vue from 'vue'
import App from './App'

// 引入语音识别和语音合成的工具类
import SpeechRecognition from './utils/speech-recognition.js'
import TextToSpeech from './utils/text-to-speech.js'
import KnowledgeService from './utils/knowledge-service.js'
import ModelBuilder from './utils/model-builder.js'

Vue.config.productionTip = false

// 百度千帆API配置
const API_CONFIG = {
  apiKey: 'UenGRY86Xhrmgrmi0uIGyY5Q',
  secretKey: 'Lb8BkiDEz2BUQArgmpJpCtwM2Yq40O7a',
  model: 'ERNIE-4.5-turbo-vl-32k',
  endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_4.5_turbo_vl_32k'
}

// 全局挂载知识库服务和ModelBuilder
Vue.prototype.$speechRecognition = new SpeechRecognition()
Vue.prototype.$textToSpeech = new TextToSpeech()
Vue.prototype.$knowledgeService = new KnowledgeService()
Vue.prototype.$modelBuilder = new ModelBuilder({
  apiKey: API_CONFIG.apiKey,
  secretKey: API_CONFIG.secretKey,
  model: API_CONFIG.model,
  endpoint: API_CONFIG.endpoint
})

console.log('初始化全局ModelBuilder实例:' + API_CONFIG.model)

App.mpType = 'app'

// 全局混入，为所有组件添加语音相关方法
Vue.mixin({
  beforeCreate() {
    const app = getApp()
    
    if (app && app.globalData) {
      // 文本转语音服务
      this.$textToSpeech = {
        speak(text) {
          return new Promise((resolve, reject) => {
            try {
              if (app.globalData.textToSpeech) {
                app.globalData.textToSpeech.speak({
                  text,
                  volume: 1.0,
                  rate: 1.0,
                  pitch: 1.0
                })
                resolve()
              } else {
                console.log('TTS service not initialized, trying local service')
                if (Vue.prototype.$textToSpeech) {
                  Vue.prototype.$textToSpeech.speak(text)
                    .then(() => resolve())
                    .catch(e => reject(e))
                } else {
                  console.error('TTS service not initialized')
                  reject(new Error('TTS service not initialized'))
                }
              }
            } catch (e) {
              console.error('Speech playback failed:', e)
              reject(e)
            }
          })
        }
      }
      
      // 语音识别服务
      this.$speechRecognition = {
        startRecording() {
          try {
            if (app.globalData.speechRecognition) {
              app.globalData.speechRecognition.startRecognize()
              return true
            } else if (Vue.prototype.$speechRecognition) {
              return Vue.prototype.$speechRecognition.startRecording()
            }
            return false
          } catch (e) {
            console.error('Failed to start recording:', e)
            return false
          }
        },
        
        stopRecording() {
          try {
            if (app.globalData.speechRecognition) {
              app.globalData.speechRecognition.stopRecognize()
              return true
            } else if (Vue.prototype.$speechRecognition) {
              return Vue.prototype.$speechRecognition.stopRecording()
            }
            return false
          } catch (e) {
            console.error('Failed to stop recording:', e)
            return false
          }
        },
        
        recognizeSpeech(text) {
          return new Promise((resolve) => {
            //模拟语音识别结果
            //TODO: 在生产环境中替换为实际的语音识别 API
            setTimeout(() => {
              if (text === 'temp') {
                resolve('如何办理银行卡挂失？')
              } else {
                resolve(text || '未能识别您的语音')
              }
            }, 500)
          })
        }
      }
    }
  }
})

const app = new Vue({
  ...App
})

app.$mount() 
