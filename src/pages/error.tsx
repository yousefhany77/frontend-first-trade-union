import { Button, Container, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { FC } from 'react';

interface ErroPage {}

const ErroPage: FC<ErroPage> = ({}) => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 250px)',
      }}
    >
      <Title
        sx={{
          fontSize: 40,
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        خطآ
      </Title>
      <Text
        sx={{
          fontSize: 30,
          textAlign: 'center',
        }}
        my={'sm'}
      >
        حدث خطأ ما
      </Text>

      <Button my={'lg'} href={'/'} component={Link} size="lg">
        العودة إلى الصفحة الرئيسية
      </Button>
    </Container>
  );
};

export default ErroPage;
