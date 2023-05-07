import { Group, Title, Loader } from '@mantine/core';
import { FC } from 'react'

interface PageLoaderProps {
  title: string
}

const PageLoader: FC<PageLoaderProps> = ({title}) => {
  return (
    <Group
      sx={{
        flexDirection: 'column',
      }}
    >
      <Title
        align="center"
        style={{
          marginTop: '20px',
          marginBottom: '20px',
          fontWeight: 800,
        }}
      >
        {title}
      </Title>
      <Loader size="md" />
    </Group>
  );
}

export default PageLoader