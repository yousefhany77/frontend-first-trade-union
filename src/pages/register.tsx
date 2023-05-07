import { registerSchema, useAuth } from '@/context/Auth';
import { Box, Button, Container, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const registertionKey = z.object({
  registertionKey: z.string().min(10),
});
interface RegisterData extends z.infer<typeof registerSchema> {
  registertionKey: string;
}
function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      registertionKey: '',
    },
    validate: {
      name: (_value) => {
        const value = _value.trim();
        const errors = registerSchema.shape.name.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      email: (value) => {
        const errors = registerSchema.shape.email.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      password: (value) => {
        const errors = registerSchema.shape.password.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      registertionKey: (value) => {
        const errors = registertionKey.shape.registertionKey.safeParse(value);
        return errors.success ? null : 'الرجاء ادخال كلمه سر الخاصه باضافه مستخدم جديد';
      },
    },
    validateInputOnChange: true,
  });
  const { register, user } = useAuth();
  const handleSubmit = async (userData: RegisterData) => {
    setIsSubmitting(true);
    try {
      await register(userData);
      toast.success('تم تسجيل الدخول بنجاح');
      Router.push('/');
    } catch (error) {
      if (error instanceof Error) return toast.error(error.message);

      toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };
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
            <TextInput size="md" placeholder="Name" {...form.getInputProps('name')} required />
            <TextInput mt="sm" size="md" placeholder="Email" {...form.getInputProps('email')} required />
            <TextInput
              mt="sm"
              size="md"
              placeholder="password"
              type={'password'}
              {...form.getInputProps('password')}
              required
            />
            <TextInput
              mt="sm"
              size="md"
              placeholder="registration registertionKey"
              type={'text'}
              {...form.getInputProps('registertionKey')}
            />
            <Button
              type="submit"
              mt="sm"
              sx={{
                width: '100%',
              }}
              loading={isSubmitting}
            >
              تسجيل
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
}

export default Register;
