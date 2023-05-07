import { InvestmentWithInvestor } from '@/pages/investments';
import { utils, writeFile } from 'xlsx';

type Data = InvestmentWithInvestor;
export const handleToExcel = async (data: Data[], title: string, filename: string) => {
  console.log('🚀 ~ file: downloadExcel.ts:6 ~ handleToExcel ~ title:', title);
  const cleanData = clean(data);
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(cleanData);

  utils.book_append_sheet(wb, ws, title);
  writeFile(wb, `${filename}.xlsx`);
};

const clean = (data: Data[]) => {
  const cleanData = data.map((item) => ({
    ...(item?.investor && { 'اسم المستثمر': item.investor.name }),
    'نوع الاستثمار': item.type === 'BONDS' ? 'ودائع' : 'شهادات',
    المبلغ: item.amount.toLocaleString(),
    الفائدة: item.interestRate * 100,
    'تاريخ الإصدار': new Date(item.createdAt).toLocaleDateString('ar-EG'),
    'تاريخ الاستحقاق': new Date(item.redemptionDate).toLocaleDateString('ar-EG'),
    'تم الاسترداد': item.redeemed ? 'نعم' : 'لا',
    البنك: item.bank.bankName,
    'رقم الحساب': item.bank.accountNumber,
    'القيمة عند الاستحقاق': item.valueOnMaturity.toLocaleString(),
    'رقم الاستثمار': item.customId,
    'العائد على الاستثمار': `${item.ROI} %`,
  }));
  return cleanData;
};
