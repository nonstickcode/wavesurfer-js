import PropTypes from 'prop-types';

const CustomSlider = ({ value, onChange, min, max, step }) => (
  <div className="slider-container">
    <div
      className="slider-track"
      style={{ width: `${((value - min) / (max - min)) * 100}%` }}
    ></div>
    <input
      type="range"
      className="slider"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
    />
  </div>
);

export default CustomSlider;
