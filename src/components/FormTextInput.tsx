import { TextInputProps, TextInput, NumberInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { FC } from "react";

interface FormTextInputProps extends TextInputProps {
  placeholder: string;
  formProps: any;
  withLabel?: boolean;
  type?: 'number' | 'text' | 'date';
}
const FormTextInput: FC<FormTextInputProps> = ({ placeholder, formProps, type = 'text', withLabel = false }) => {
  switch (type) {
    case 'text':
      return (
        <TextInput
          styles={{
            input: {
              textAlign: 'start',
            },
            label: {
              display: withLabel ? 'block' : 'none',
              color: 'gray',
              marginBottom: '0.5rem',
              marginRight: '0.5rem',
              textAlign: 'start',
            },
          }}
          {...formProps}
          mt="sm"
          size="md"
          label={withLabel ? placeholder : undefined}
          placeholder={placeholder}
        />
      );
    case 'number':
      return (
        <NumberInput
          label={withLabel ? placeholder : undefined}
          hideControls
          styles={{
            input: {
              textAlign: 'start',
            },
            label: {
              display: withLabel ? 'block' : 'none',
              color: 'gray',
              marginBottom: '0.5rem',
              marginRight: '0.5rem',
              textAlign: 'start',
            },
          }}
          {...formProps}
          mt="sm"
          size="md"
          placeholder={placeholder}
        />
      );
    case 'date':
      return (
        <DatePickerInput
          label={withLabel ? placeholder : undefined}
          styles={{
            input: {
              textAlign: 'start',
            },
            label: {
              display: withLabel ? 'block' : 'none',
              color: 'gray',
              marginBottom: '0.5rem',
              marginRight: '0.5rem',
              textAlign: 'start',
            },
            calendar: {
              direction: 'ltr',
            },
          }}
          {...formProps}
          mt="sm"
          size="md"
          minDate={new Date()}
          placeholder={placeholder}
        />
      );
  }
};

export default FormTextInput;