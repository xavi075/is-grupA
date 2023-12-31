// functions module
import { format } from 'date-fns';

export const convertDate = (date: string) => {
  const DateObject = new Date(date);
  const formattedDate = format(DateObject, 'dd-MM-yyyy HH:mm:ss')
  return formattedDate; 
}