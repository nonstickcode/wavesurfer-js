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
  waveColor: 'white',
  progressColor: '#39ff14',
  cursorColor: '#39ff14',
  responsive: true,
  height: 50,
  normalize: false, // height to height of container
  backend: 'WebAudio',
  barWidth: 2,
  barGroup: 3,
});

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
    // Check if the ref is null
    if (!waveformRef.current) {
      console.error('Waveform ref is null');
      return;
    }
  
    // Initialize Wavesurfer only if it hasn't been initialized yet
    if (!wavesurfer.current) {
      console.log('Creating new Wavesurfer instance');
      const options = formWaveSurferOptions(waveformRef.current);
      wavesurfer.current = WaveSurfer.create(options);
  
      // Load the audio file
      console.log(`Loading audio file: ${audioFile}`);
      wavesurfer.current.load(audioFile);
  
      // Event listener for when Wavesurfer is ready
      wavesurfer.current.on('ready', () => {
        console.log('Wavesurfer ready');
        setVolume(wavesurfer.current.getVolume());
        setDuration(wavesurfer.current.getDuration());
        setAudioFileName(audioFile.split('/').pop());
      });
  
      // Event listener for audio process
      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });
  
      // Event listener for errors
      wavesurfer.current.on('error', (error) => {
        console.error('Wavesurfer error:', error);
      });
    } else {
      // If the Wavesurfer instance already exists, just load the new audio file
      console.log('Wavesurfer instance already exists, loading new audio file');
      wavesurfer.current.load(audioFile);
    }
  
    // Cleanup function
    return () => {
      console.log('Cleaning up Wavesurfer');
      if (wavesurfer.current) {
        wavesurfer.current.un('audioprocess');
        wavesurfer.current.un('ready');
        wavesurfer.current.un('error');
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioFile]); // Dependency array includes only audioFile
  

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
    <div className='waveform-container' >
      <div id="waveform" ref={waveformRef} style={{ width: '100%' }}></div>
      <div className="controls">
        {/* Play/Pause Button */}
        <button onClick={handlePlayPause}>
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>

        {/* Mute/Unmute Button */}
        <button onClick={handleMute}>
          <FontAwesomeIcon icon={muted ? faVolumeOff : faVolumeMute} />
        </button>

        {/* Volume Slider */}
        <input
          type="range"
          id="volume"
          name="volume"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        />

        {/* Volume Down Button */}
        <button onClick={handleVolumeDown}>
          <FontAwesomeIcon icon={faVolumeDown} />
        </button>

        {/* Volume Up Button */}
        <button onClick={handleVolumeUp}>
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
        <span>{muted ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`}</span>
      </div>
    </div>
  );
}
