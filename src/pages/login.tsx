import { loginSchema, useAuth } from '@/context/Auth';
import { Box, Button, Container, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        const errors = loginSchema.shape.email.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      password: (value) => {
        const errors = loginSchema.shape.password.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
    },
    validateInputOnChange: true,
  });
  const { signIn } = useAuth();
  const handleSubmit = async (userData: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(userData);
      toast.success('تم تسجيل الدخول بنجاح');
      Router.push('/');
    } catch (error) {
      if (error instanceof Error) return toast.error(error.message);

      toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      Router.push('/');
    }
  }, [user]);
  return (
    <>
      <Head>
        <title>تسجيل الدخول</title>
      </Head>
      <Container
        style={{
          marginTop: 20,
          minHeight: 'calc(100vh - 250px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction: 'ltr',
        }}
      >
        <Box maw={320} mx="auto" w={'100%'}>
          <Title align="center" style={{ marginBottom: 20 }} order={1} mb="lg" size={30}>
            تسجيل الدخول
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)} dir="ltr">
            <TextInput mt="sm" size="md" placeholder="Email" {...form.getInputProps('email')} />
            <TextInput mt="sm" size="md" placeholder="password" type={'password'} {...form.getInputProps('password')} />
            <Button
              type="submit"
              mt="sm"
              sx={{
                width: '100%',
              }}
              loading={isSubmitting}
            >
              تسجيل الدخول
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
}

export default Login;
