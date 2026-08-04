let currentScene = 1
const totalScenes = 2
const confettiContainer = document.getElementById('confetti')
const startBtn = document.getElementById('startRecord')
const stopBtn = document.getElementById('stopRecord')

function nextScene(){
  document.getElementById('scene' + currentScene).classList.remove('active')
  currentScene = Math.min(totalScenes, currentScene + 1)
  document.getElementById('scene' + currentScene).classList.add('active')
}

function blowCandle(){
  const flame = document.getElementById('flame')
  if(!flame) return
  // extinguish animation
  flame.style.transition = 'transform 700ms ease, opacity 700ms ease'
  flame.style.transform = 'scale(0.1) translateY(-6px)'
  flame.style.opacity = '0'
  // confetti burst
  burstConfetti(60)
  // show a little celebration pulse
  const card = document.querySelector('.card-container')
  card.classList.add('recording')
  setTimeout(()=>card.classList.remove('recording'),1200)
}

function burstConfetti(amount=40){
  const colors = ['#ff6b81','#ffd54f','#8be9a8','#8ec5ff','#d9a7ff']
  for(let i=0;i<amount;i++){
    const el = document.createElement('div')
    el.className = 'confetti'
    el.style.background = colors[Math.floor(Math.random()*colors.length)]
    const startX = Math.random()*100
    el.style.left = startX + '%'
    el.style.top = '-10%'
    el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`
    el.style.width = (6 + Math.random()*10) + 'px'
    el.style.height = (8 + Math.random()*12) + 'px'
    confettiContainer.appendChild(el)

    // animate using requestAnimationFrame for randomness
    requestAnimationFrame(()=>{
      const endX = startX + (Math.random()*60-30)
      const endY = 80 + Math.random()*20
      const rotate = Math.random()*720
      el.style.transition = `transform ${2+Math.random()*1.5}s cubic-bezier(.2,.8,.2,1), top ${2+Math.random()*1.5}s linear, left ${2+Math.random()*1.5}s linear, opacity 1.8s ease`
      el.style.left = endX + '%'
      el.style.top = endY + '%'
      el.style.transform = `translateY(0) rotate(${rotate}deg)`
      el.style.opacity = '0'
    })

    // cleanup
    setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el) }, 3500)
  }
}

// Recording using getDisplayMedia (user selects tab/window)
let recorder, recordedChunks = []
async function startRecording(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia){
    alert('Screen recording is not supported in this browser.')
    return
  }
  try{
    // ask user to share screen/tab; choose current tab and allow system audio if desired
    const stream = await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30}, audio:true})
    recorder = new MediaRecorder(stream, {mimeType:'video/webm;codecs=vp9'})
    recordedChunks = []
    recorder.ondataavailable = e=>{ if(e.data && e.data.size) recordedChunks.push(e.data) }
    recorder.onstop = ()=>{
      const blob = new Blob(recordedChunks, {type:'video/webm'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'happy-birthday.webm'
      a.click()
      URL.revokeObjectURL(url)
    }
    recorder.start()
    startBtn.disabled = true
    stopBtn.disabled = false
  }catch(err){
    console.error('Recording failed',err)
  }
}

function stopRecording(){
  if(recorder && recorder.state !== 'inactive') recorder.stop()
  startBtn.disabled = false
  stopBtn.disabled = true
}

// wire controls
if(startBtn) startBtn.addEventListener('click', startRecording)
if(stopBtn) stopBtn.addEventListener('click', stopRecording)

// friendly keyboard shortcuts
document.addEventListener('keydown', e=>{
  if(e.key === 'Enter') nextScene()
  if(e.key === 'r') startRecording()
  if(e.key === 's') stopRecording()
})
