import { Button, Container, SimpleGrid, Title } from '@mantine/core';
import { GetServerSideProps } from 'next';

import PageLoader from '@/components/PageLoader';
import { Paper, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Head from 'next/head';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DashboardProps {
  totalInvestorsBalance: number | null;
  totalProfit: number;
  avgInterestRate: number | null;
  avgROI: number | null;
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(
    '🚀 ~ file: index.tsx:21 ~ constgetServerSideProps:GetServerSideProps= ~ process.env.SERVER_SIDE_API_URL:',
    process.env.SERVER_SIDE_API_URL
  );
  try {
    const res = await fetch(process.env.SERVER_SIDE_API_URL + '/investment/aggregate', {
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
    const data = await res.json();
    return {
      props: {
        data,
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

function Dashboard({ data: intialData }: { data: DashboardProps }) {
  const { data, isLoading } = useQuery<DashboardProps>(
    ['dashboard'],
    async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/investment/aggregate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error);
      }
      const data = await res.json();
      return data;
    },
    {
      initialData: intialData,
    }
  );
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading: isMutating } = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
      try {
        // Set start and end dates to the same hour
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        if (startDate > endDate && startDate !== endDate) throw new Error('يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء');
        const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/investment/aggregate');
        url.searchParams.append('startDate', startDate.toISOString());
        url.searchParams.append('endDate', endDate.toISOString());
        const data = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!data.ok) {
          const error = await data.json();
          throw new Error(error);
        }
        return data.json();
      } catch (error) {
        if (error instanceof Error) toast.error(error.message);
        else toast.error('حدث خطأ ما');
      }
    },
    onSuccess: (data) => queryClient.setQueryData(['dashboard'], data),
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  if (isLoading) return <PageLoader title="ملخص الاستثمارات" />;
  if (!data) return null;
  return (
    <Container>
      <Head>
        <title>ملخص الاستثمارات</title>
      </Head>
      <Title
        align="center"
        style={{
          marginTop: '20px',
          marginBottom: '20px',
          fontWeight: 800,
        }}
      >
        ملخص الاستثمارات
      </Title>

      <SimpleGrid
        sx={{
          alignItems: 'center',
        }}
        cols={3}
      >
        <DatePickerInput
          placeholder="فلتر حسب تاريخ الاصدار"
          value={startDate}
          onChange={setStartDate}
          my={20}
          maxDate={endDate ?? new Date()}
          styles={{
            calendar: {
              direction: 'ltr',
            },
            placeholder: {
              textAlign: 'center',
              width: '100%',
              display: 'block',
            },
          }}
        />
        <DatePickerInput
          placeholder="فلتر حسب تاريخ الاصدار الي"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate ?? new Date()}
          my={20}
          styles={{
            calendar: {
              direction: 'ltr',
            },
            placeholder: {
              textAlign: 'center',
              width: '100%',
              display: 'block',
            },
          }}
        />
        <Button
          onClick={() => {
            if (!startDate || !endDate) return toast.error('يجب اختيار تاريخين');
            mutateAsync({ startDate, endDate });
          }}
          loaderProps={{
            mx: 5,
          }}
          loading={isMutating || isLoading}
        >
          <Text>تطبيق</Text>
        </Button>
        <DashboardCard title="إجمالي رصيد " value={data.totalInvestorsBalance?.toLocaleString() ?? '0'} />
        <DashboardCard title="إجمالي الأرباح" value={data.totalProfit.toLocaleString() ?? '0'} />
        <DashboardCard title="متوسط العائد السنوي" value={data.avgROI?.toLocaleString() ?? '0'} presentage />
        <DashboardCard
          title="
متوسط الفائدة السنوية"
          presentage
          value={data.avgInterestRate?.toLocaleString() ?? '0'}
        />
      </SimpleGrid>
    </Container>
  );
}

export default Dashboard;

export function DashboardCard({
  title,
  value,
  presentage = false,
}: {
  title: string;
  value: string;
  presentage?: boolean;
}) {
  return (
    <Paper shadow="xs" p="md">
      <Text size="sm" weight={500} style={{ marginBottom: 5 }}>
        {title}
      </Text>
      <Text size="xl" weight={700} m={'md'}>
        {value ?? 0} {presentage ? '%' : 'جنيه'}
      </Text>
    </Paper>
  );
}
