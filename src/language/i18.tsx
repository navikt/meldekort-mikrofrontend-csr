import "dayjs/locale/nb";

import dayjs from "dayjs";

dayjs.locale("nb");

export const formatDayAndMonth = (date: string | number | Date | dayjs.Dayjs | null | undefined) =>
  dayjs(date).locale("nb").format("DD.MM.YYYY");
