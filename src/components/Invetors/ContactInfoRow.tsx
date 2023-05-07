import { Group, Text } from '@mantine/core';
import React from 'react';
import { CopyButton } from '../util/CopyButton';

const ContactInfoRow = React.forwardRef(function comp(
  { value }: { value: string | number },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <Group
      ref={ref}
      sx={{
        alignItems: 'center',
        justifyContent: 'start',
        paddingInline: '0.5rem',
      }}
    >
      <CopyButton value={value} />
      <Text>{value}</Text>
    </Group>
  );
});

export default ContactInfoRow;
