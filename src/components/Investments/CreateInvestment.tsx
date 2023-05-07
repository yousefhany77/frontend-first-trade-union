import { Button, Modal, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import FormTextInput from '../FormTextInput';
import { errorHandler } from '../util/errorHandler';

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

export const investmentSchema = z.object({
  type: z.enum(['BONDS', 'CERTIFICATES'], {
    invalid_type_error: 'Investment Type must be a valid type',
    required_error: 'Investment Type is Required',
  }),
  amount: z
    .number({
      invalid_type_error: 'Investment Amount must be a number',
      required_error: 'Investment Amount is Required',
    })
    .min(1, {
      message: 'Investment Amount must be greater than 0',
    }),
  valueOnMaturity: z
    .number({
      invalid_type_error: 'Investment valueOnMaturity must be a number',
      required_error: 'Investment valueOnMaturity is Required',
    })
    .min(1, {
      message: 'Investment Amount must be greater than 0',
    }),
  interestRate: z
    .number({
      invalid_type_error: 'Investment Interest Rate must be a number',
      required_error: 'Investment Interest Rate is Required',
    })
    .max(100, {
      message: 'Investment Interest Rate must be less than 100',
    })
    .min(1, {
      message: 'Investment Interest Rate must be greater than 1',
    }),
  redemptionDate: z
    .date({
      invalid_type_error: 'Investment Redemption Date must be a date',
      required_error: 'Investment Redemption Date is Required',
    })
    .min(new Date(), {
      message: 'Investment Redemption Date must be greater than today',
    }),
  bank: BankDataSchema,

  customId: z.string().nullable(),
  investorId: z.string().uuid(),
  redeemed: z.boolean().nullable(),
});

interface Props {
  bank: z.infer<typeof BankDataSchema>;
  investorId: string;
  disabled?: boolean;
}
const CreateInvestemnt: FC<Props> = ({ bank, investorId, disabled }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (data: z.infer<typeof investmentSchema>) => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/investment/new', {
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
    onMutate: async (data: z.infer<typeof investmentSchema>) => {
      await queryClient.cancelQueries({ queryKey: ['all-investments', investorId] });
      const previousInvestors = queryClient.getQueryData(['all-investments', investorId]);
      queryClient.setQueryData(['all-investments', investorId], (old: any) => [...old, data]);
      return { previousInvestors };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(['all-investments', investorId], context.previousInvestors);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['all-investments', investorId]);
    },
  });
  const form = useForm({
    initialValues: {
      customId: '',
      type: 'BONDS',
      amount: 0,
      valueOnMaturity: 0,
      interestRate: 0,
      redemptionDate: undefined as Date | undefined,
    },
    validate: {
      type: (value) => {
        const errors = investmentSchema.shape.type.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      amount: (value) => {
        const errors = investmentSchema.shape.amount.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      interestRate: (value) => {
        const errors = investmentSchema.shape.interestRate.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      redemptionDate: (value) => {
        const errors = investmentSchema.shape.redemptionDate.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
    },
    clearInputErrorOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSumbit = async (data: z.infer<typeof investmentSchema>) => {
    try {
      setIsSubmitting(true);
      data.interestRate = data.interestRate / 100;
      data.valueOnMaturity = data.amount * (1 + data.interestRate);
      await mutateAsync(data);
      toast.success('تم إضافة الاستثمار بنجاح');
      form.reset();
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
        dir="rtl"
        opened={opened}
        onClose={close}
        title="إضافة استثمار جديد"
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
            const { amount, valueOnMaturity, ...rest } = data;
            // this is just for typescript to not complain
            if (!data.redemptionDate)
              return form.setFieldError('redemptionDate', 'Investment Redemption Date is Required');
            return handleSumbit({
              ...rest,
              amount: Number(amount),
              valueOnMaturity: Number(valueOnMaturity),
              bank,
              investorId,
              redeemed: false,
              interestRate: Number(data.interestRate),
              redemptionDate: data.redemptionDate,
              type: data.type as any,
            });
          })}
        >
          <Select
            styles={{
              input: {
                textAlign: 'start',
              },
              label: {
                color: 'gray',
                marginBottom: '0.5rem',
                marginRight: '0.5rem',
                textAlign: 'start',
              },
            }}
            label="نوع الاستثمار"
            {...form.getInputProps('type')}
            mt="sm"
            size="md"
            data={[
              { label: 'ودائع', value: 'BONDS' },
              { label: 'شهادات ', value: 'CERTIFICATES' },
            ]}
          />
          <FormTextInput withLabel placeholder="رقم الاستثمار" formProps={form.getInputProps('customId')} />
          <FormTextInput withLabel placeholder="المبلغ" formProps={form.getInputProps('amount')} type="number" />
          <FormTextInput withLabel placeholder="الفائدة" formProps={form.getInputProps('interestRate')} type="number" />

          <FormTextInput
            withLabel
            placeholder="تاريخ الاستحقاق"
            formProps={form.getInputProps('redemptionDate')}
            type="date"
          />

          <Button
            variant="light"
            type="submit"
            mt="sm"
            sx={{
              width: '100%',
            }}
            loading={isSubmitting}
          >
            إضافة استثمار
          </Button>
        </form>
      </Modal>
      <Button onClick={open} variant="light" disabled={disabled}>
        إضافة استثمار
      </Button>
    </>
  );
};

export default CreateInvestemnt;
