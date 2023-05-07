import CreateInvestemnt from '@/components/Investments/CreateInvestment';
import InvestmentsTable from '@/components/Investments/Table';
import AgentDetails from '@/components/Invetors/Agent';
import Recovre from '@/components/Invetors/Recovre';
import PageLoader from '@/components/PageLoader';
import { errorHandler } from '@/components/util/errorHandler';
import { DashboardCard } from '@/pages';
import { Agent, Investment, Investor } from '@/type';
import { handleToExcel } from '@/utils/downloadExcel';
import { Button, Collapse, Container, Group, Select, SimpleGrid, Title, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { QueryClient, dehydrate, useMutation, useQuery } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoArrowDownCircleOutline, IoArrowUpCircleOutline, IoDownloadOutline } from 'react-icons/io5';

export interface InvestorDetailsProps extends Investor {
  investments: Investment[];
  agent: Agent[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const id = context.params?.id;
  try {
    const res = await fetch(process.env.SERVER_SIDE_API_URL + `/investor/${id}`, {
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
      if (error.statusCode === 404) {
        return {
          notFound: true,
        };
      }
      throw new Error(error);
    }
    const data = await res.json();
    await queryClient.prefetchQuery(['investor', id], async () => data);
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

function InvestorDetails() {
  const { query, push } = useRouter();
  const id = query.id as string;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'createdAt' | 'redemptionDate'>('createdAt');
  const [sortType, setSortType] = useState<'asc' | 'desc'>();
  const [opened, { toggle }] = useDisclosure(false);

  const { isLoading, isError, data } = useQuery<InvestorDetailsProps>({
    queryKey: ['investor', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investor/${id}`, {
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
  });

  const { data: investments, refetch } = useQuery<Investment[]>({
    queryKey: ['all-investments', id],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/investment/list');
      url.searchParams.append('investorId', id);
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
    enabled: !!id,
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
          const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/investment/list');
          url.searchParams.append('investorId', id);
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
        }
        case 'sort': {
          // sort local data by amount
          const sortedData = investments?.sort((a, b) => {
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
  const dashboardData = useMemo(() => {
    if (!investments) return;
    const totalAmount = investments.reduce((acc, curr) => {
      if (curr.redeemed) return acc;
      return acc + curr.amount;
    }, 0);
    const avgROI =
      investments.reduce((acc, curr) => {
        if (!curr?.ROI) return acc;
        return acc + Number(curr.ROI);
      }, 0) / investments.length;

    return {
      totalAmount,
      avgROI,
    };
  }, [investments]);
  
  useEffect(() => {
    if (!sortType) return;
    mutateAsync('sort');
    toast.success(` تم ترتيب الاستثمارات ${sortType === 'asc' ? 'تصاعدياً' : 'تنازلياً'} بنجاح `);
  }, [mutateAsync, sortType]);

  if (isLoading || !investments) return <PageLoader title="جاري تحميل بيانات المستثمر" />;
  if (isError) return push('/error');
  return (
    <>
      <Head>
        <title>{`${data.name}`}</title>
      </Head>
      <Container size={'xl'}>
        <Tooltip label="اضغط لعرض ملخص البيانات">
          <Title
            order={1}
            style={{
              textAlign: 'center',
              margin: '2rem 0',
            }}
          >
            <Button size="xl" variant="ghost" onClick={toggle}>
              {data.name} {data.deletedAt && '(محذوف)'}
            </Button>
          </Title>
        </Tooltip>
        <Collapse in={opened}>
          <SimpleGrid cols={3}>
            <DashboardCard title="الرصيد الحالي" value={data.balance.toLocaleString()} />
            {dashboardData && (
              <>
                <DashboardCard title="اجمالي الاسثمارات الحاليه" value={dashboardData?.totalAmount.toLocaleString()} />
                <DashboardCard title="متوسط العائد" value={dashboardData?.avgROI.toFixed(2)} presentage />
              </>
            )}
          </SimpleGrid>
        </Collapse>
        <Group align="end" px="xl">
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
        </Group>
        <Group px={'xl'} mt={'sm'} mb={'lg'}>
          <CreateInvestemnt investorId={id} bank={data.bank[0]} disabled={data.deletedAt !== null} />
          <AgentDetails {...data} investorId={id} disabled={data.deletedAt !== null} />
          <Recovre investorId={id} disabled={data.deletedAt === null} />
          <Button
            sx={(theme) => ({
              backgroundColor: theme.colors.teal[9],
              color: theme.colors.white,
              '&:hover': {
                backgroundColor: theme.colors.teal[8],
              },
            })}
            onClick={() =>
              handleToExcel(
                investments,
                `  استثمارات ${data.name}`,
                `استثمارات ${data.name} ${startDate?.toLocaleDateString('ar-EG') || ''} - ${
                  endDate?.toLocaleDateString('ar-EG') || ''
                } - ${dateFilterType === 'createdAt' ? 'الإصدار' : 'الاستحقاق'}`
              )
            }
            disabled={investments.length === 0}
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
        <InvestmentsTable investments={investments} />
      </Container>
    </>
  );
}

export default InvestorDetails;
