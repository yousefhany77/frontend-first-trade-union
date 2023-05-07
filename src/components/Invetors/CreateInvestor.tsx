import { Button, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

export const BankDataSchema = z.object({
  bankName: z
    .string({
      invalid_type_error: 'Bank Name must be a string',
      required_error: 'Bank Name is Required',
    })
    .min(2)
    .max(255),
  accountNumber: z
    .string({
      invalid_type_error: 'Account Number must be a string',
      required_error: 'Account Number is Required',
    })
    .min(2)
    .max(255),
});

export const investorSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      required_error: 'Name is Required',
    })
    .min(2)
    .max(255),
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
      required_error: 'Email is Required',
    })
    .email({
      message: 'Invalid email',
    }),
  code: z.number({
    invalid_type_error: 'Code must be a number',
    required_error: 'Code is Required',
  }),
  phone: z
    .string({
      required_error: 'Phone is Required',
      invalid_type_error: 'Phone not valid',
    })
    .min(10, {
      message: 'Number must be at least 10 digits',
    })
    .max(12, {
      message: 'Number must be less than 12 digits',
    }),
  bank: z
    .array(BankDataSchema, {
      invalid_type_error: 'Bank data must be in array',
      required_error: 'Bank is Required',
    })
    .min(1, {
      message: 'Bank must have at least one entry',
    }),
  address: z
    .string({
      invalid_type_error: 'Address must be a string',
      required_error: 'Address is Required',
    })
    .min(2)
    .max(255),
  balance: z.number({
    invalid_type_error: 'Balance must be a number',
    required_error: 'Balance is Required',
  }),
});
const CreateInvestor: FC<{}> = ({}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (data: z.infer<typeof investorSchema>) => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/investor/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
      }
      const json = await res.json();
      setIsSubmitting(false);
      return json;
    },
    onMutate: async (data: z.infer<typeof investorSchema>) => {
      await queryClient.cancelQueries({ queryKey: ['investors'] });
      const previousInvestors = queryClient.getQueryData(['investors']);
      queryClient.setQueryData(['investors'], (old: any) => [...old, data]);
      return { previousInvestors };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(['investors'], context.previousInvestors);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['investors']);
    },
  });
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      code: '',
      phone: '',
      address: '',
      balance: '',
      bankName: '',
      accountNumber: '',
    },
    validate: {
      email: (value) => {
        const errors = investorSchema.shape.email.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      name: (value) => {
        const errors = investorSchema.shape.name.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      code: (value) => {
        const errors = investorSchema.shape.code.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      phone: (value) => {
        const errors = investorSchema.shape.phone.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      address: (value) => {
        const errors = investorSchema.shape.address.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      balance: (value) => {
        const errors = investorSchema.shape.balance.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      accountNumber: (value) => {
        const errors = BankDataSchema.shape.accountNumber.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      bankName: (value) => {
        const errors = BankDataSchema.shape.bankName.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
    },
    clearInputErrorOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSumbit = async (data: z.infer<typeof investorSchema>) => {
    try {
      setIsSubmitting(true);
      await mutateAsync(data);
      close();
    } catch (err) {
      if (err instanceof Error) {
        const error = JSON.parse(err.message);
        if (error.title === 'Prisma Error') {
          const target = error?.metaData?.target as string[];
          const errorMessage = `${target.join(' ')} ${error?.message}`;
          toast.error(errorMessage);
        }
      } else toast.error('حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        dir="rtl"
        opened={opened}
        onClose={close}
        title="إضافة مستثمر جديد"
        centered
        styles={{
          title: {
            textAlign: 'center',
            width: '100%',
            fontWeight: 700,
            padding: '1rem 0',
          },
        }}
      >
        <form
          onSubmit={form.onSubmit((data) => {
            const { accountNumber, bankName ,...rest } = data;
            return handleSumbit({
              ...rest,
              code: Number(data.code),
              balance: Number(data.balance),
              bank: [
                {
                  bankName,
                  accountNumber,
                },
              ],
            });
          })}
        >
          <FormTextInput formProps={form.getInputProps('code')} placeholder="الكود" type="number" />
          <FormTextInput formProps={form.getInputProps('name')} placeholder="الاسم" />
          <FormTextInput formProps={form.getInputProps('email')} placeholder="البريد الالكتروني" />
          <FormTextInput formProps={form.getInputProps('phone')} placeholder="رقم الهاتف" />
          <FormTextInput formProps={form.getInputProps('address')} placeholder="العنوان" />
          <FormTextInput formProps={form.getInputProps('bankName')} placeholder="اسم البنك" />
          <FormTextInput formProps={form.getInputProps('accountNumber')} placeholder="رقم الحساب" />
          <FormTextInput formProps={form.getInputProps('balance')} placeholder="الرصيد" type="number" />
          <Button
            variant="light"
            type="submit"
            mt="sm"
            sx={{
              width: '100%',
            }}
            loading={isSubmitting}
          >
            إضافة مستثمر جديد
          </Button>
        </form>
      </Modal>
      <Button onClick={open} variant="subtle">
        إضافة مستثمر جديد
      </Button>
    </>
  );
};

export default CreateInvestor;

const FormTextInput: FC<{ placeholder: string; formProps: any; type?: 'number' | 'text' }> = ({
  placeholder,
  formProps,
  type = 'text',
}) =>
  type === 'text' ? (
    <TextInput
      styles={{
        input: {
          textAlign: 'center',
        },
      }}
      {...formProps}
      mt="sm"
      size="md"
      placeholder={placeholder}
    />
  ) : (
    <NumberInput
      hideControls
      styles={{
        input: {
          textAlign: 'center',
        },
      }}
      {...formProps}
      mt="sm"
      size="md"
      placeholder={placeholder}
    />
  );
