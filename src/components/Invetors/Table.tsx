import { Agent, Investor } from '@/type';
import { Anchor, Button, Divider, Group, Popover, SimpleGrid, Table, Text, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { FC } from 'react';
import ContactInfoRow from './ContactInfoRow';
import DeleteInvestor from './DeleteInvestor';
import UpdateInvestor from './UpdateInvestor';

export interface InvestorTableProps extends Investor {
  ROI: number;
  investmentsCount: number;
  agent: Agent[];
}
export const headers = [
  'كود',
  'اسم',
  'معلومات التواصل',
  'معلومات البنكية',
  'الاسثمارات',
  'رصيد',
  'نسبة العائد الاستثماري',
];

const InvestorsTable: FC<{
  data: InvestorTableProps[];
}> = ({ data }) => {
  const investorsRows = data.map((investor) => (
    <tr
      style={{
        backgroundColor: investor.deletedAt ? '#ff0000b8' : 'white',
      }}
      key={investor.id}
    >
      <td>{investor.code}</td>
      <td>{investor.name}</td>
      <td>
        <Popover width={300} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Text
              sx={(theme) => ({
                cursor: 'pointer',
                textDecoration: 'underline',
                color: theme.colors.blue[5],
              })}
            >
              اضغط للمزيد
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <SimpleGrid cols={1} spacing="xs">
              <Tooltip label="رقم الهاتف">
                <ContactInfoRow value={investor.phone} />
              </Tooltip>
              <Tooltip label="البريد الالكتروني">
                <ContactInfoRow value={investor.email} />
              </Tooltip>
              <Tooltip label="العنوان">
                <ContactInfoRow value={investor.address} />
              </Tooltip>
              {investor?.agent?.length >= 1 ? (
                <>
                  {' '}
                  <Text>الوكيل</Text>
                  {investor.agent
                    .filter((agent) => agent.deletedAt === null)
                    .map((agent) => (
                      <>
                        <Divider my="sm" key={agent.id + 'diveder'} />
                        <Group key={agent.id}>
                          <Tooltip label="اسم الوكيل">
                            <ContactInfoRow value={agent.name} />
                          </Tooltip>
                          <Tooltip label="رقم الهاتف">
                            <ContactInfoRow value={agent.phone} />
                          </Tooltip>
                          <Tooltip label="العنوان">
                            <ContactInfoRow value={agent.address} />
                          </Tooltip>
                        </Group>{' '}
                      </>
                    ))}
                </>
              ) : null}
            </SimpleGrid>
          </Popover.Dropdown>
        </Popover>
      </td>

      <td>
        <Popover position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Text
              sx={(theme) => ({
                cursor: 'pointer',
                textDecoration: 'underline',
                color: theme.colors.blue[5],
              })}
            >
              اضغط للمزيد
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <SimpleGrid cols={1} spacing="xs">
              {investor.bank.map((bank) => (
                <Group key={bank.accountNumber}>
                  <ContactInfoRow value={bank.accountNumber} />
                  <Text
                    sx={(theme) => ({
                      color: theme.colors.gray[6],
                      fontWeight: 700,
                    })}
                  >
                    {bank.bankName}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>
          </Popover.Dropdown>
        </Popover>
      </td>
      <td>
        {
          <Tooltip label="عرض الاستثمارات">
            <Anchor component={Link} href={`/investors/${investor.id}`}>
              عرض ({investor.investmentsCount})
            </Anchor>
          </Tooltip>
        }
      </td>
      <td>{investor.balance.toLocaleString()}</td>
      <td>{investor?.ROI?.toLocaleString()}٪</td>
      <td>
        <Group>
          <UpdateInvestor
            investor={{
              id: investor.id,
              accountNumber: investor.bank[0].accountNumber,
              bankName: investor.bank[0].bankName,
              address: investor.address,
              email: investor.email,
              name: investor.name,
              phone: investor.phone,
              balance: `${investor.balance}`,
              code: `${investor.code}`,
            }}
          />
          <DeleteInvestor id={investor.id} />
          <Button component={Link} href={`/investors/${investor.id}`} variant="light">
            عرض تفاصيل
          </Button>
        </Group>
      </td>
    </tr>
  ));
  const tableHeader = (
    <tr>
      {headers.map((header) => (
        <th
          key={header}
          style={{
            textAlign: 'right',
          }}
        >
          {header}
        </th>
      ))}
      <th>
        <Text sx={{ textAlign: 'right' }}>العمليات</Text>
      </th>
    </tr>
  );
  return (
    <Table fontSize="md" style={{ width: '100%' }} highlightOnHover>
      <thead>{tableHeader}</thead>
      <tbody>{investorsRows}</tbody>
    </Table>
  );
};

export default InvestorsTable;
