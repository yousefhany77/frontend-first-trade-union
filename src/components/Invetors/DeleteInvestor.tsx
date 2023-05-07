import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';

interface DeleteInvestorProps {
  id: string;
}

const DeleteInvestor: FC<DeleteInvestorProps> = ({ id }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investor/${id}`, {
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
      await queryClient.cancelQueries({ queryKey: ['investors'] });
      const previousInvestors = queryClient.getQueryData(['investors']);
      queryClient.setQueryData(['investors'], (old: any) => old.filter((investor: any) => investor.id !== id));
      return { previousInvestors };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(['investors'], context.previousInvestors);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['investors']);
    },
  });
  return (
    <>
      <Modal
        title="
        هل أنت متأكد من حذف المستثمر؟
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

export default DeleteInvestor;
