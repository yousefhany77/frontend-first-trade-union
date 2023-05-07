import { InvestmentWithInvestor } from '@/pages/investments';
import { Container, Group, Table } from '@mantine/core';
import { FC } from 'react';
import DeleteInvestment from './DeleteInvestment';
import EarlyRedeem from './EarlyRedeem';
import UpdateInvestment from './UpdateInvestments';

interface TableProps {
  investments: InvestmentWithInvestor[];
}

const InvestmentsTable: FC<TableProps> = ({ investments }) => {
  const header = [
    'نوع الاستثمار',
    'المبلغ',
    'الفائدة',
    'تاريخ الإصدار ',
    'تاريخ الاستحقاق',
    'تم الاسترداد',
    'البنك',
    'القيمة عند الاستحقاق',
    'رقم الاستثمار',
    'العائد على الاستثمار',
    ' ',
  ];
  const tableHeaders = (
    <tr>
      {investments[0]?.investor?.name && <th style={{ textAlign: 'center' }}>اسم المستثمر</th>}
      {header.map((item, index) => (
        <th key={index} style={{ textAlign: 'center' }}>
          {item}
        </th>
      ))}
    </tr>
  );
  const tableRows = investments.map((item, index) => (
    <tr key={index}>
      {item.investor?.name && <td style={{ textAlign: 'center' }}>{item.investor?.name}</td>}
      <td style={{ textAlign: 'center' }}>{item.type === 'BONDS' ? 'ودائع' : 'شهادات'}</td>
      <td style={{ textAlign: 'center' }}>{item.amount.toLocaleString()}</td>
      <td style={{ textAlign: 'center' }}>{item.interestRate * 100}%</td>
      <td style={{ textAlign: 'center' }}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
      <td style={{ textAlign: 'center' }}>{new Date(item.redemptionDate).toLocaleDateString('ar-EG')}</td>

      <td style={{ textAlign: 'center' }}>{item.redeemed ? 'نعم' : 'لا'}</td>
      <td style={{ textAlign: 'center' }}>{item.bank.bankName}</td>
      <td style={{ textAlign: 'center' }}>{item.valueOnMaturity} جنيه</td>
      <td style={{ textAlign: 'center' }}>{item.customId ?? 'N/A'}</td>
      <td style={{ textAlign: 'center' }}>{item.ROI?.toLocaleString()}٪</td>
      <td>
        <Group noWrap>
          <DeleteInvestment id={item.id} investorId={item.investorId} redeemed={item.redeemed} />
          <UpdateInvestment {...item} investmentId={item.id} />
          <EarlyRedeem
            id={item.id}
            investorId={item.investorId}
            minValue={Number(item.amount)}
            redeemed={item.redeemed}
          />
        </Group>
      </td>
    </tr>
  ));
  return (
    <Container
      size={'xl'}
      style={{
        overflowX: 'auto',
        width: '100%',
        height: '100%',
      }}
    >
      <Table fontSize="md" highlightOnHover verticalSpacing="xs">
        <thead>{tableHeaders}</thead>
        <tbody>{tableRows}</tbody>
      </Table>
    </Container>
  );
};

export default InvestmentsTable;
