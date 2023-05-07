import CreateInvestor from '@/components/Invetors/CreateInvestor';
import InvestorsTable, { InvestorTableProps } from '@/components/Invetors/Table';
import PageLoader from '@/components/PageLoader';
import { Button, Container, Group, Title } from '@mantine/core';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import React, { FC, useEffect } from 'react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  try {
    const res = await fetch(process.env.SERVER_SIDE_API_URL + '/investor/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: context.req.headers.cookie || '',
      },

      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      if (error.statusCode === 401 || error.statusCode === 403) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }
      throw new Error(error);
    }
    const data = (await res.json()) as InvestorTableProps[];
    await queryClient.prefetchQuery(['investors'], async () => data);
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    };
  }
};

const InvestorsPage: FC<{}> = () => {
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const { isLoading, isError, data, refetch } = useQuery<InvestorTableProps[]>({
    queryKey: ['investors'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investor/list?deleted=${includeDeleted}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message, {
          cause: error.title,
        });
      }
      const data = (await res.json()) as InvestorTableProps[];
      return data;
    },
  });

  useEffect(() => {
    refetch();
  }, [includeDeleted, refetch]);
  if (isLoading) {
    return <PageLoader title="المستثمرين" />;
  }
  if (isError) {
    Router.push('/error');
    return null;
  }

  return (
    <>
      <Head>
        <title> المستثمرين</title>
      </Head>
      <Container size="xl">
        <Title
          order={1}
          style={{
            textAlign: 'center',
            margin: '2rem 0',
          }}
        >
          المستثمرين
        </Title>
        <Group position="apart" style={{ marginBottom: '2rem' }}>
          <CreateInvestor />
          <Button
            sx={(theme) => ({
              backgroundColor: theme.colors[includeDeleted ? 'red' : 'blue'][7],
            })}
            onClick={() => {
              setIncludeDeleted(!includeDeleted);
            }}
          >
            {includeDeleted ? 'إخفاء المحذوفين' : 'إظهار المحذوفين'}
          </Button>
        </Group>
        <InvestorsTable data={data} />
      </Container>
    </>
  );
};

export default InvestorsPage;
