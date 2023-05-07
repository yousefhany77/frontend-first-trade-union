import InvestmentsTable from '@/components/Investments/Table';
import { errorHandler } from '@/components/util/errorHandler';
import { Investment } from '@/type';
import { handleToExcel } from '@/utils/downloadExcel';
import { Button, Container, Group, Select, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { QueryClient, dehydrate, useMutation, useQuery } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoArrowDownCircleOutline, IoArrowUpCircleOutline, IoDownloadOutline } from 'react-icons/io5';

export interface InvestmentWithInvestor extends Investment {
  investor?: {
    name: string;
  };
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const url = new URL(process.env.SERVER_SIDE_API_URL + '/investment/list?withInvestor=true');
  try {
    const res = await fetch(url.toString(), {
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
    const data = (await res.json()) as InvestmentWithInvestor[];
    await queryClient.prefetchQuery(['all-investments'], async () => data);
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

const InvestmentsPage: FC<{}> = ({}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'createdAt' | 'redemptionDate'>('createdAt');
  const [sortType, setSortType] = useState<'asc' | 'desc'>();

  const { isError, data, isLoading, refetch } = useQuery<InvestmentWithInvestor[]>({
    queryKey: ['all-investments'],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/investment/list');
      url.searchParams.append('withInvestor', 'true');
      url.searchParams.append('dateFilterType', dateFilterType);
      startDate && url.searchParams.append('startDate', startDate.toISOString());
      endDate && url.searchParams.append('endDate', endDate.toISOString());
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
      }
      const data = await res.json();
      return data;
    },
    onError: (error) => {
      errorHandler(error);
    },
  });
  const { mutateAsync } = useMutation({
    mutationFn: async (type: 'date' | 'sort') => {
      switch (type) {
        case 'date': {
          if (startDate && endDate && startDate > endDate && startDate !== endDate)
            throw new Error('يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء');
          const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/investment/list?withInvestor=true');
          startDate && url.searchParams.append('startDate', startDate.toDateString());
          endDate && url.searchParams.append('endDate', endDate.toDateString());
          url.searchParams.append('dateFilterType', dateFilterType);
          const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error));
          }
          const data = await res.json();
          return data;
        }
        case 'sort': {
          // sort local data by amount
          const sortedData = data?.sort((a, b) => {
            if (sortType === 'asc') {
              return a.amount - b.amount;
            } else {
              return b.amount - a.amount;
            }
          });
          return sortedData;
        }
      }
    },
  });
  useEffect(() => {
    if (!sortType) return;
    mutateAsync('sort');
    toast.success(` تم ترتيب الاستثمارات ${sortType === 'asc' ? 'تصاعدياً' : 'تنازلياً'} بنجاح `);
  }, [mutateAsync, sortType]);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  return (
    <Container size="xl">
      <Title
        my={40}
        order={2}
        style={{
          textAlign: 'center',
        }}
      >
        الاستثمارات
      </Title>
      <Group align="end">
        <Group>
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

              item: {
                textAlign: 'right',
              },
            }}
            value={dateFilterType}
            defaultValue={dateFilterType}
            label="نوع التاريخ"
            placeholder="نوع التاريخ"
            onChange={(value) => {
              setDateFilterType(value as 'createdAt' | 'redemptionDate');
            }}
            mt="sm"
            size="md"
            w={140}
            data={[
              { label: 'الإصدار', value: 'createdAt' },
              { label: 'الاستحقاق ', value: 'redemptionDate' },
            ]}
          />
          <DatePickerInput
            placeholder="فلتر حسب التاريخ من"
            label="فلتر حسب التاريخ من"
            value={startDate}
            onChange={setStartDate}
            my={20}
            maxDate={endDate ?? undefined}
            styles={{
              calendar: {
                direction: 'ltr',
              },
              placeholder: {
                textAlign: 'center',
                width: '100%',
                display: 'block',
              },
              label: {
                fontSize: '1rem',
                margin: '0.5rem',
              },
              input: {
                textAlign: 'center',
              },
            }}
          />
          <DatePickerInput
            label="فلتر حسب التاريخ الي"
            placeholder="فلتر حسب التاريخ الي"
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
              label: {
                fontSize: '1rem',
                margin: '0.5rem',
              },
              input: {
                textAlign: 'center',
              },
            }}
          />
        </Group>
        <Button
          mb={'lg'}
          disabled={!(startDate || endDate)}
          onClick={async () => {
            await mutateAsync('date');
            refetch();
          }}
        >
          تطبيق الفلتر
        </Button>
        <Button
          styles={{
            rightIcon: {
              marginRight: '0.5rem',
              marginLeft: 0,
            },
          }}
          rightIcon={sortType === 'asc' ? <IoArrowDownCircleOutline size={'1rem'} /> : <IoArrowUpCircleOutline />}
          mb={'lg'}
          onClick={async () => {
            setSortType(sortType === 'asc' ? 'desc' : 'asc');
          }}
        >
          ترتيب حسب المبلغ
        </Button>
        <Button
          mb={'lg'}
          sx={(theme) => ({
            backgroundColor: theme.colors.teal[9],
            color: theme.colors.white,
            '&:hover': {
              backgroundColor: theme.colors.teal[8],
            },
          })}
          onClick={() =>
            handleToExcel(
              data,
              `  استثمارات `,
              `استثمارات  ${startDate?.toLocaleDateString('ar-EG') || ''} - ${
                endDate?.toLocaleDateString('ar-EG') || ''
              } - ${dateFilterType === 'createdAt' ? 'الإصدار' : 'الاستحقاق'}`
            )
          }
          disabled={data.length === 0}
          styles={{
            rightIcon: {
              marginRight: '0.5rem',
              marginLeft: 0,
            },
          }}
          rightIcon={<IoDownloadOutline size={'1rem'} />}
        >
          تحميل البيانات
        </Button>
      </Group>
      <InvestmentsTable investments={data} />;
    </Container>
  );
};

export default InvestmentsPage;
