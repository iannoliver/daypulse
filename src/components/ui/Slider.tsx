interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
}

export function Slider({ value, min, max, step = 1, onChange, label }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #7c6af7 ${percent}%, #1a1a24 ${percent}%)`,
        }}
      />
      {label && (
        <p className="text-center text-sm text-white/60 mt-2">{label}</p>
      )}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c6af7;
          cursor: pointer;
          border: 2px solid #0f0f13;
          box-shadow: 0 0 0 2px #7c6af7;
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c6af7;
          cursor: pointer;
          border: 2px solid #0f0f13;
        }
      `}</style>
    </div>
  )
}
