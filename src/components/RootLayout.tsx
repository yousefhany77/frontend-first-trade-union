import { AppShell, Header } from '@mantine/core';

import { FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { z } from 'zod';
import Navbar from './Navbar';

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  z.object({
    NEXT_PUBLIC_API_URL: z.string().url(),
  }).parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
  return (
    <AppShell
      padding="md"
      header={
        <Header
          height={80}
          sx={{
            fontWeight: 800,
            fontSize: 24,
            fontFamily: 'tajawal',
          }}
        >
          <Navbar />
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          fontFamily: 'tajawal',
        },
      })}
    >
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
        position="top-center"
        reverseOrder={false}
      />
      {children}
    </AppShell>
  );
};

export default RootLayout;
