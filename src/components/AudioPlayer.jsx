import { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import CustomSlider from './CustomSlider';
import defaultAudio1 from '../assets/defaultAudio1.mp3';
import defaultAudio2 from '../assets/defaultAudio2.mp3';
import defaultAudio3 from '../assets/defaultAudio3.mp3';
import defaultAudio4 from '../assets/defaultAudio4.mp3';
import defaultAudio5 from '../assets/defaultAudio5.mp3';

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

function formatTime(seconds) {
  let date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

export default function AudioPlayer() {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const fileInputRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const defaultAudioFiles = [
    { name: 'Default Audio 1', url: defaultAudio1 },
    { name: 'Default Audio 2', url: defaultAudio2 },
    { name: 'Default Audio 3', url: defaultAudio3 },
    { name: 'Default Audio 4', url: defaultAudio4 },
    { name: 'Default Audio 5', url: defaultAudio5 },
  ];

  const [audioFiles, setAudioFiles] = useState(defaultAudioFiles);
  const [selectedFile, setSelectedFile] = useState(defaultAudioFiles[0]);

  useEffect(() => {
    if (!waveformRef.current || !selectedFile) {
      return;
    }

    wavesurfer.current = WaveSurfer.create(
      formWaveSurferOptions(waveformRef.current)
    );

    wavesurfer.current.load(selectedFile.url);

    wavesurfer.current.on('ready', () => {
      setVolume(wavesurfer.current.getVolume());
      setDuration(wavesurfer.current.getDuration());
      setCurrentTime(0);
      if (playing) {
        wavesurfer.current.play();
      }
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on('error', (error) => {
      console.error('Wavesurfer error:', error);
    });

    return () => {
      wavesurfer.current.destroy();
    };
  }, [selectedFile]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (muted && newVolume > 0) {
      setMuted(false);
    }
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    }
    setMuted(newVolume === 0);
  };

  const handleMute = () => {
    setMuted(!muted);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(muted ? volume : 0);
    }
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
      addFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      addFile(files[0]);
    }
  };

  const addFile = (file) => {
    const url = URL.createObjectURL(file);
    const newFile = { name: file.name, url };
    setAudioFiles((prevFiles) => [...prevFiles, newFile]);
    setSelectedFile(newFile);
  };

  return (
    <div className="waveform-container">
      <div className="title">Waveform.js</div>

      <div className="dropdown-selector">
        <select
          onChange={(e) => setSelectedFile(audioFiles[e.target.value])}
          value={audioFiles.findIndex((file) => file === selectedFile)}
        >
          {audioFiles.map((file, index) => (
            <option key={index} value={index}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      <div id="waveform" ref={waveformRef} style={{ width: '100%' }}></div>

      <div className="controls">
        <button onClick={handlePlayPause}>
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>

        <button onClick={handleMute}>
          <FontAwesomeIcon icon={muted ? faVolumeOff : faVolumeMute} />
        </button>

        <CustomSlider
        value={muted ? 0 : volume}
        min="0"
        max="1"
        step="0.05"
        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        label={muted ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`}
        labelStyle={{ color: muted ? 'red' : 'inherit' }} // Conditional label style
      />

        <button onClick={handleVolumeDown}>
          <FontAwesomeIcon icon={faVolumeDown} />
        </button>

        <button onClick={handleVolumeUp}>
          <FontAwesomeIcon icon={faVolumeUp} />
        </button>
      </div>

      <div className="audio-info">
        <span>
          Playing: {selectedFile ? selectedFile.name : 'No file selected'}{' '}
          <br />
        </span>
        <span>
          Current Time: {formatTime(currentTime)}
          <br />
          Duration: {formatTime(duration)}
        </span>
      </div>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
      >
        Drag and drop your MP3 file here or click to upload
        <FontAwesomeIcon className="upload-icon" icon={faUpload} />
        <input
          type="file"
          onChange={handleFileChange}
          accept=".mp3"
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
}

AudioPlayer.propTypes = {
  audioFile: PropTypes.string,
};
