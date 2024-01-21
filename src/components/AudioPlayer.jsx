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
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: 'white',
  progressColor: '#39ff14',
  cursorColor: '#39ff14',
  responsive: true,
  height: 50,
  normalize: false,
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
  const fileInputRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioFileName, setAudioFileName] = useState('');

  // Initialize Wavesurfer and set up event listeners
  useEffect(() => {
    if (!waveformRef.current) {
      console.error('Waveform ref is null');
      return;
    }

    if (!wavesurfer.current) {
      const options = formWaveSurferOptions(waveformRef.current);
      wavesurfer.current = WaveSurfer.create(options);
      wavesurfer.current.load(audioFile);
  
      wavesurfer.current.on('ready', () => {
        setVolume(wavesurfer.current.getVolume());
        setDuration(wavesurfer.current.getDuration());
        setAudioFileName(audioFile.split('/').pop());
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      wavesurfer.current.on('error', (error) => {
        console.error('Wavesurfer error:', error);
      });
    } else {
      wavesurfer.current.load(audioFile);
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.un('audioprocess');
        wavesurfer.current.un('ready');
        wavesurfer.current.un('error');
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioFile]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  const handleVolumeChange = (newVolume) => {
    if (muted && newVolume > 0) {
      setMuted(false);
    }
    setVolume(newVolume);
    wavesurfer.current.setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleMute = () => {
    setMuted(!muted);
    wavesurfer.current.setVolume(muted ? volume : 0);
  };

  const handleVolumeUp = () => {
    handleVolumeChange(Math.min(volume + 0.1, 1));
  };

  const handleVolumeDown = () => {
    handleVolumeChange(Math.max(volume - 0.1, 0));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    const url = URL.createObjectURL(file);
    loadAudioFile(url);
    setAudioFileName(file.name);
  };

  const loadAudioFile = (fileUrl) => {
    if (wavesurfer.current) {
      wavesurfer.current.load(fileUrl);
    }
  };

  return (
    <div className='waveform-container'>
      <div id="waveform" ref={waveformRef} style={{ width: '100%' }}></div>
      <div className="controls">
        <button onClick={handlePlayPause}>
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>

        <button onClick={handleMute}>
          <FontAwesomeIcon icon={muted ? faVolumeOff : faVolumeMute} />
        </button>

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

        <button onClick={handleVolumeDown}>
          <FontAwesomeIcon icon={faVolumeDown} />
        </button>

        <button onClick={handleVolumeUp}>
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>
      </div>

      <div className="audio-info">
        <span>Playing: {audioFileName} <br /></span>
        <span>Duration: {formatTime(duration)} | Current Time: {formatTime(currentTime)} <br /></span>
        <span>{muted ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`}</span>
      </div>

      <div className="drop-zone" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()}>
        Drag and drop your MP3 file here or click to upload
        <FontAwesomeIcon className='upload-icon' icon={faUpload} />
        <input type="file" onChange={handleFileChange} accept=".mp3" style={{ display: 'none' }} ref={fileInputRef} />
      </div>
    </div>
  );
}
