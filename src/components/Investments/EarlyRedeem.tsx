import { Investment } from '@/type';
import { Button, Group, Modal, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FC, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface EarlyRedeemProps {
  id: string;
  investorId: string;
  minValue: number;
  redeemed: boolean;
}

const EarlyRedeem: FC<EarlyRedeemProps> = ({ id, investorId, minValue, redeemed }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { pathname } = useRouter();
  const queryKey = pathname === '/investments' ? ['all-investments'] : ['all-investments', investorId];
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investment/redeem/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueOnMaturity: Number(inputRef.current?.value),
        }),
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const previousInvestments = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldInvestments?: Investment[]) => {
        if (oldInvestments) {
          return oldInvestments.map((investment) => {
            if (investment.id === id) {
              return {
                ...investment,
                redeemed: true,
                valueOnMaturity: Number(inputRef.current?.value),
              };
            }
            return investment;
          });
        }
        return oldInvestments;
      });
      return { previousInvestments };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(queryKey, context.previousInvestments);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
  const handleEarlyRedeem = async () => {
    if (inputRef.current?.value && Number(inputRef.current?.value) < minValue) {
      return toast.error(`القيمة أقل من الحد الأدنى ${minValue} جنيه`);
    }
    try {
      await mutateAsync();
      toast.success('تم اضافة الاسترداد المبكر بنجاح');
    } catch (error) {
      if (error instanceof Error) toast.error(JSON.parse(error.message).message);
      else toast.error('حدث خطأ ما');
    } finally {
      close();
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Modal
        title="
       القيمة عند الاستحقاق
      "
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
        <NumberInput
          mb={'lg'}
          placeholder="القيمة عند الاستحقاق"
          hideControls
          ref={inputRef}
          styles={{
            input: {
              textAlign: 'center',
            },
          }}
        />
        <Group position="center">
          <Button w={'45%'} loading={isSubmitting} onClick={handleEarlyRedeem} variant="filled">
            تسجيل
          </Button>
          <Button w={'45%'} loading={isSubmitting} onClick={close} variant="outline" color="blue">
            الغاء
          </Button>
        </Group>
      </Modal>

      <Group position="center">
        <Button
          loading={isSubmitting}
          disabled={redeemed}
          onClick={open}
          variant="filled"
          sx={{
            transition: 'all ease-in-out 0.3s',
          }}
        >
          استحقاق
        </Button>
      </Group>
    </>
  );
};

export default EarlyRedeem;
