import AudioPlayer from './components/AudioPlayer';
import AudioFile from './assets/audio.mp3';

import './App.css';

function App() {


  return (
    <>
      <AudioPlayer audioFile={AudioFile} />   
    </>
  )
}

export default App
