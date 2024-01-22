import PropTypes from 'prop-types';

const CustomSlider = ({ value, onChange, min, max, step, label, labelStyle }) => (
  <div className="slider-container">
     <label className="slider-label" style={labelStyle}>{label}</label>
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

CustomSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  label: PropTypes.string,
  labelStyle: PropTypes.object
};

export default CustomSlider;
