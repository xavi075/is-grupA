// functions module
import { format } from 'date-fns';
import moment from 'moment';
 

export const convertDate = (date: string) => {
  const DateObject = moment(date, 'ddd, DD MMM YYYY HH:mm:ss [GMT]');
  const formattedDate = DateObject.format('DD-MM-yyyy HH:mm:ss');
  return formattedDate; 
}

export const timePassed = (startingData: string, FinalData: string): string => {
  const dataStart = new Date(startingData)
  const dataFinal = new Date(FinalData)

  const difference: number = dataFinal.getTime() - dataStart.getTime();

  const sec: number = Math.floor(difference / 1000) % 60;
  const min: number = Math.floor(difference / (1000 * 60)) % 60;
  const hours: number = Math.floor(difference / (1000 * 60 * 60));

  const time: string = `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  return time;
}