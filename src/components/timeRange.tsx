import React from "react";
import { useFormContext, Controller } from "react-hook-form";

interface TimePickerProps {
  control: any;
  name: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ control, name, className }) => {
  const { field, fieldState } = useFormContext().control.register(name);

  return (
    <div className={className}>
      <label>Time:</label>
      <Controller
        render={({ field }) => (
          <input
            type="time"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
        control={control}
        name={name}
      />
      {fieldState.error && <p className="text-red-500">{fieldState.error.message}</p>}
    </div>
  );
};

export default TimePicker;
