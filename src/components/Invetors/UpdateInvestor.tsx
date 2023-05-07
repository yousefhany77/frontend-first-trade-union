import { Button, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { z } from 'zod';
import FormTextInput from '../FormTextInput';
import { errorHandler } from '../util/errorHandler';

export const BankDataSchema = z
  .object({
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
  })
  .partial();

export const investorSchema = z
  .object({
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
  })
  .partial();

interface UpdateInvestorProps {
  email?: string;
  name?: string;
  code?: string;
  phone?: string;
  address?: string;
  balance?: string;
  bankName?: string;
  accountNumber?: string;
  id: string;
}

const UpdateInvestor: FC<{
  investor: UpdateInvestorProps;
}> = ({ investor }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (data: z.infer<typeof investorSchema>) => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investor/${investor.id}`, {
        method: 'PATCH',
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
      email: investor.email || '',
      name: investor.name || '',
      code: Number(investor.code) || '',
      phone: investor.phone || '',
      address: investor.address || '',
      balance: Number(investor.balance) || '',
      bankName: investor.bankName || '',
      accountNumber: investor.accountNumber || '',
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
      errorHandler(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        title="تعديل مستثمر"
        dir="rtl"
        opened={opened}
        onClose={close}
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
            const { accountNumber, bankName, ...rest } = data;
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
          <FormTextInput withLabel formProps={form.getInputProps('code')} placeholder="الكود" type="number" />
          <FormTextInput withLabel formProps={form.getInputProps('name')} placeholder="الاسم" />
          <FormTextInput withLabel formProps={form.getInputProps('email')} placeholder="البريد الالكتروني" />
          <FormTextInput withLabel formProps={form.getInputProps('phone')} placeholder="رقم الهاتف" />
          <FormTextInput withLabel formProps={form.getInputProps('address')} placeholder="العنوان" />
          <FormTextInput withLabel formProps={form.getInputProps('bankName')} placeholder="اسم البنك" />
          <FormTextInput withLabel formProps={form.getInputProps('accountNumber')} placeholder="رقم الحساب" />
          <FormTextInput withLabel formProps={form.getInputProps('balance')} placeholder="الرصيد" type="number" />
          <Button
            variant="light"
            type="submit"
            mt="sm"
            sx={{
              width: '100%',
            }}
            loading={isSubmitting}
          >
            تعديل
          </Button>
        </form>
      </Modal>
      <Button disabled={isSubmitting} onClick={open} variant="light">
        تعديل
      </Button>
    </>
  );
};

export default UpdateInvestor;
