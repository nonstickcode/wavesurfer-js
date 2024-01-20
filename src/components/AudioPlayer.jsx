import { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faVolumeOff,
} from '@fortawesome/free-solid-svg-icons';

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: '#fff',
  progressColor: '#0178ff',
  cursorColor: 'transparent',
  responsive: true,
  height: 200,
  normalize: true, // height to height of container
  backend: 'WebAudio',
  barWidth: 2,
  barGroup: 3,
})

// Helper function to format time
function formatTime(seconds) {
  let date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

export default function AudioPlayer({ audioFile }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioFileName, setAudioFileName] = useState('');

// Initialize Wavesurfer and set up event listeners
useEffect(() => {
  console.log("Initializing Wavesurfer");

  if (!wavesurfer.current) {
    console.log("Creating new Wavesurfer instance");
    const options = formWaveSurferOptions(waveformRef.current);
    wavesurfer.current = WaveSurfer.create(options);
  } else {
    console.log("Wavesurfer instance already exists");
  }


  // Load the audio file
  wavesurfer.current.load(audioFile);

  // When Wavesurfer is ready
  wavesurfer.current.on('ready', () => {
    setVolume(wavesurfer.current.getVolume());
    setDuration(wavesurfer.current.getDuration());
    setAudioFileName(audioFile.split('/').pop());
  });

  // Update current time in state as audio plays
  wavesurfer.current.on('audioprocess', () => {
    setCurrentTime(wavesurfer.current.getCurrentTime());
  });

  // Clean up event listeners and destroy instance on unmount
  return () => {
    wavesurfer.current.un('audioprocess');
    wavesurfer.current.un('ready');
    // Unsubscribe from any other events you have subscribed to
    wavesurfer.current.destroy();
  };
}, [audioFile]);

// Toggle playback of audio
const handlePlayPause = () => {
  setPlaying(!playing);
  wavesurfer.current.playPause();
};

// Adjust audio volume
// Adjust audio volume
const handleVolumeChange = (newVolume) => {
  if (muted && newVolume > 0) {
    setMuted(false);
  }
  setVolume(newVolume);
  wavesurfer.current.setVolume(newVolume);
  setMuted(newVolume === 0);
};

// Toggle mute/unmute audio
const handleMute = () => {
  setMuted(!muted);
  wavesurfer.current.setVolume(muted ? volume : 0);
};

// Increase volume by 10%
const handleVolumeUp = () => {
  handleVolumeChange(Math.min(volume + 0.1, 1));
};

// Decrease volume by 10%
const handleVolumeDown = () => {
  handleVolumeChange(Math.max(volume - 0.1, 0));
};

  return (
    <div>
    <div id="waveform" ref={waveformRef} style={{ width: '100%' }} ></div>
      <div className="controls">

        {/* Play/Pause Button */}
        <button onClick={handlePlayPause} >
          <FontAwesomeIcon icon={ playing ? faPause : faPlay } />
        </button>

        {/* Mute/Unmute Button */}
        <button onClick={handleMute} >
          <FontAwesomeIcon icon={ muted ? faVolumeOff : faVolumeMute } />
        </button>

        {/* Volume Slider */}
        <input
          type= 'range'
          id='volume'
          name='volume'
          min='0'
          max='1'
          step='0.05'
          value={ muted ? 0 : volume }
          onChange={ (e) => handleVolumeChange(parseFloat(e.target.value)) }
        />

        {/* Volume Down Button */}
        <button onClick={handleVolumeDown} >
          <FontAwesomeIcon icon={faVolumeDown} />
        </button>

        {/* Volume Up Button */}
        <button onClick={handleVolumeUp} >
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>

      </div>

      {/* Audio file name and current play time */}
      <div className="audio-info">
        <span>
          Playing: {audioFileName} <br />
        </span>
        <span>
          Duration: {formatTime(duration)} | Current Time:{' '}
          {formatTime(currentTime)} <br />
        </span>
        <span>
          Volume: {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  )
}