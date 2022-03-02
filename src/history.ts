import axios from 'axios';
import { format } from 'date-fns';

export const getHistoricalPrices = async (a: {
  companyId: any;
  securityId: any;
  startDate: string | number | Date;
  endDate: string | number | Date;
}) => {
  return axios
    .post('https://edge.pse.com.ph/common/DisclosureCht.ax', {
      cmpy_id: a.companyId,
      security_id: a.securityId,
      startDate: format(new Date(a.startDate), 'MM-dd-yyyy'),
      endDate: format(a.endDate ? new Date(a.endDate) : new Date(), 'MM-dd-yyyy'),
    })
    .then(
      (v) =>
        v.data.chartData as {
          OPEN: number;
          VALUE: number;
          CLOSE: number;
          CHART_DATE: string;
          HIGH: number;
          LOW: number;
        }[],
    )
    .then((v) =>
      v.map((w) => ({
        o: w.OPEN,
        h: w.HIGH,
        l: w.LOW,
        c: w.CLOSE,
        t: format(new Date(w.CHART_DATE), 'yyyy-MM-dd'),
        value: w.VALUE,
      })),
    );
};
