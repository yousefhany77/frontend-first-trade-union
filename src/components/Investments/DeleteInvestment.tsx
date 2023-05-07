import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

interface DeleteInvestmentProps {
  id: string;
  investorId: string;
  redeemed: boolean;
}

const DeleteInvestment: FC<DeleteInvestmentProps> = ({ id, investorId, redeemed }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { pathname } = useRouter();
  const queryKey = pathname === '/investments' ? ['all-investments'] : ['all-investments', investorId];
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investment/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const previousInvestmets = queryClient.getQueryData(['all-investments', investorId]);
      queryClient.setQueryData(queryKey, (old: any) => old.filter((investment: any) => investment.id !== id));
      return { previousInvestmets };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(queryKey, context.previousInvestmets);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
  return (
    <>
      <Modal
        title="
        هل أنت متأكد من حذف الاستثمار؟
      "
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
        <Group position="center">
          <Button
            w={'45%'}
            loading={isSubmitting}
            onClick={() => {
              mutateAsync();
              close();
            }}
            variant="outline"
            color="red"
          >
            نعم
          </Button>
          <Button w={'45%'} loading={isSubmitting} onClick={close} variant="outline" color="blue">
            لا
          </Button>
        </Group>
      </Modal>

      <Group position="center">
        <Button
          onClick={open}
          loading={isSubmitting}
          disabled={redeemed}
          variant="outline"
          color="red"
          sx={{
            transition: 'all ease-in-out 0.3s',
            '&:hover': {
              backgroundColor: 'red',
              color: 'white',
            },
          }}
        >
          حذف
        </Button>
      </Group>
    </>
  );
};

export default DeleteInvestment;
