import { useAuth } from '@/context/Auth';
import { Avatar, Menu, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

function UserMenu() {
  const { user, logout } = useAuth();
  const { pathname } = useRouter();
  if (!user) return null;
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar
          style={{
            cursor: 'pointer',
          }}
          radius="xl"
          color="blue"
        >
          {user.name[0].toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown
        sx={{
          fontWeight: 'normal',
        }}
      >
        <Menu.Label>اقسام</Menu.Label>
        <Menu.Item href={'/'} component={Link} color={pathname === '/' ? 'blue' : 'dark'}>
          ملخص الاستثمارات
        </Menu.Item>
        <Menu.Item component={Link} href={'/investors'} color={pathname === '/investors' ? 'blue' : 'dark'}>
          المستثمرين
        </Menu.Item>
        <Menu.Item component={Link} href={'/investments'} color={pathname === '/investments' ? 'blue' : 'dark'}>
          الاستثمارات
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item component={Link} href={'/register'} color={pathname === '/register' ? 'blue' : 'dark'}>
          اضافه مستخدم
        </Menu.Item>

        <Menu.Item onClick={logout}>
          <Text size="sm">تسجيل الخروج</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserMenu;
