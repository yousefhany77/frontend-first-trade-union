import { ActionIcon, CopyButton as CopyButtonMantine, Tooltip } from '@mantine/core';
import { IoCheckboxOutline } from 'react-icons/io5';
import { TbCopy } from 'react-icons/tb';
export function CopyButton({ value }: { value: string | number }) {
  return (
    <CopyButtonMantine value={value.toString()} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
          <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
            {copied ? (
              <IoCheckboxOutline
                style={{
                  borderRadius: '0.5rem',
                  color: '#339af0',
                }}
                size="1.2rem"
              />
            ) : (
              <TbCopy size="1.2rem" />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButtonMantine>
  );
}
