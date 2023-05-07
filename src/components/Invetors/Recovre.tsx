import { Button } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { toast } from 'react-hot-toast';
import { errorHandler } from '../util/errorHandler';

interface RecovreProps {
  investorId: string;
  disabled?: boolean;
}

const Recovre: FC<RecovreProps> = ({ investorId, disabled }) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/investor/recover`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ investorId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error);
      }
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['investor', investorId]);
    },
  });
  const handleRecovre = async () => {
    try {
      await mutateAsync();
      toast.success('تم استعادة الحساب بنجاح');
    } catch (error) {
      errorHandler(error);
    }
  };
  return (
    <Button onClick={handleRecovre} variant="outline" color="blue" loading={isLoading} disabled={disabled}>
      استعادة الحساب
    </Button>
  );
};

export default Recovre;
