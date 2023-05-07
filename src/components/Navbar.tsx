import { useAuth } from '@/context/Auth';
import { Button, Group, Title } from '@mantine/core';
import Link from 'next/link';
import { FC } from 'react';
import UserMenu from './UserMenu';

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const { user } = useAuth();
  return (
    <Group
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      px={'md'}
      py={'lg'}
    >
      <Title order={1} size="lg" color="blue">
        <Link style={{ textDecoration: 'none', color: 'inherit' }} href={'/'}>
          فيرست
        </Link>
      </Title>
      {user ? (
        <Group
          sx={{
            gap: 'md',
          }}
        >
          <UserMenu />
        </Group>
      ) : (
        <Button
          component={Link}
          sx={{
            fontWeight: 600,
          }}
          href={'/login'}
        >
          تسجيل الدخول
        </Button>
      )}
    </Group>
  );
};

export default Navbar;
