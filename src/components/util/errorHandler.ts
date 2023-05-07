import { toast } from 'react-hot-toast';

export const errorHandler = (err: any) => {
  if (err instanceof Error) {
    try {
      // sometimes the error message is not a valid json, so we need to catch it
      const error = JSON.parse(err.message);
      //   that means the error is a error from the custom Error class in the backend
      if (!!error.statusCode) {
        const target = error?.metaData?.target as string[];
        const errorMessage = `${target?.join(' ')} ${error?.message}`;
        toast.error(errorMessage);
        if (error.statusCode === 401 || error.statusCode === 403) window.location.href = '/login';
        return;
      }
    } catch (error) {
      return toast.error('حدث خطأ ما');
    }
  } else toast.error('حدث خطأ ما');
};
