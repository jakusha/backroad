import { ComponentPropsMapping } from 'backroad-core';
import { useState } from 'react';
import { setAndReRun } from '../../socket';

export const NumberInput = (props: ComponentPropsMapping['number_input']) => {
  const [value, setValue] = useState(props.value);
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{props.args.label}</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        placeholder="Type here"
        onBlur={(e) => {
          setAndReRun({ id: props.id, value: parseFloat(e.target.value) });
        }}
        className="input input-bordered w-full max-w-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
};
