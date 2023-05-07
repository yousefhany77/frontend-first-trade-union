import { Agent } from '@/type';
import { Button, Divider, Group, Modal, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { z } from 'zod';
import FormTextInput from '../FormTextInput';
import { errorHandler } from '../util/errorHandler';

interface AgentDetailsProps {
  agent: Agent[];
  investorId: string;
  disabled?: boolean;
}

const schema = z.object({
  name: z.string().min(5),
  phone: z.string().min(10),
  address: z.string().min(5),
});
interface AgentRegistration {
  name: string;
  phone: string;
  address: string;
  investorId: string;
}
const AgentDetails: FC<AgentDetailsProps> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      address: '',
    },
    validate: {
      name: (value) => {
        const errors = schema.shape.name.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      phone: (value) => {
        const errors = schema.shape.phone.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
      address: (value) => {
        const errors = schema.shape.address.safeParse(value);
        return errors.success ? null : errors.error.flatten().formErrors.join(' ');
      },
    },
  });
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: AgentRegistration) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }
      const json = await response.json();
      return json;
    },
    onMutate: async (data: AgentRegistration) => {
      await queryClient.cancelQueries({ queryKey: ['investor', props.investorId] });
      const previousInvestors = queryClient.getQueryData(['investor', props.investorId]);
      queryClient.setQueryData(['investor', props.investorId], (old: any) => {
        return {
          ...old,
          agents: [...old.agent, data],
        };
      });
      return { previousInvestors };
    },
    onError: (err, data, context: any) => {
      queryClient.setQueryData(['investor', props.investorId], context.previousInvestors);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['investor', props.investorId]);
    },
  });
  const { mutateAsync: deleteAgent } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/unlink/${id}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }
      const json = await response.json();
      return json;
    },
    onSettled: () => {
      queryClient.invalidateQueries(['investor', props.investorId]);
    },
  });

  // get all the deleted agents
  const { data } = useQuery<Agent[]>({
    queryKey: ['investor', 'agents', props.investorId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/investor/${props.investorId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }
      const json = await response.json();
      return json?.filter((agent: Agent) => agent.deletedAt !== null);
    },
    enabled: !!props.investorId,
  });
  const handleSumbit = async (data: { name: string; phone: string; address: string }) => {
    try {
      await mutateAsync({
        ...data,
        investorId: props.investorId,
      });
      close();
    } catch (err) {
      errorHandler(err);
    }
  };
  return (
    <>
      <Modal
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
        title="الوكيل"
      >
        <form onSubmit={form.onSubmit(handleSumbit)}>
          <FormTextInput label="الاسم" placeholder="الاسم" required formProps={form.getInputProps('name')} />
          <FormTextInput label="الهاتف" placeholder="الهاتف" required formProps={form.getInputProps('phone')} />

          <FormTextInput label="العنوان" placeholder="العنوان" required formProps={form.getInputProps('address')} />

          <Button
            variant="light"
            type="submit"
            mt="sm"
            sx={{
              width: '100%',
            }}
            loading={isLoading}
          >
            اضافة
          </Button>
        </form>
        <Divider variant="solid" my="xl" />
        <Title order={6} align="center">
          الوكيل
        </Title>
        {props.agent
          .filter((agent) => agent.deletedAt === null)
          .map((agent) => (
            <Group
              style={{
                justifyContent: 'space-between',
              }}
              key={agent.id}
            >
              <Text>
                <b>الاسم:</b> {agent.name}
              </Text>
              <Text>
                <b>الهاتف:</b> {agent.phone}
              </Text>
              <Text>
                <b>العنوان:</b> {agent.address}
              </Text>
              <Button
                variant="light"
                color="red"
                onClick={() => {
                  deleteAgent(agent.id);
                  // Router.reload();
                }}
              >
                حذف
              </Button>
              <Divider variant="solid" my="xl" />
            </Group>
          ))}

        <Divider variant="solid" my="xl" />
        {data?.length === 0 ? (
          <Text>لا يوجد وكلاء سابقين</Text>
        ) : (
          <>
            <Title order={6} align="center">
              الوكلاء السابقين
            </Title>
            {data?.map((agent) => (
              <Group
                style={{
                  justifyContent: 'space-between',
                }}
                key={agent.id}
              >
                <Text>
                  <b>الاسم:</b> {agent.name}
                </Text>
                <Text>
                  <b>الهاتف:</b> {agent.phone}
                </Text>
                <Text>
                  <b>العنوان:</b> {agent.address}
                </Text>
                <Divider variant="solid" my="xl" />
              </Group>
            ))}
          </>
        )}
      </Modal>

      <Button disabled={props.disabled} variant="light" onClick={open}>
        الوكيل
      </Button>
    </>
  );
};

export default AgentDetails;
