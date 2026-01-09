import React from "react";
import { Controller } from "react-hook-form";

interface TimePickerProps {
  control: any;
  name: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ control, name, className }) => {
  return (
    <div className={className}>
      <label>Time:</label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <input
              type="time"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <p className="text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default TimePicker;
