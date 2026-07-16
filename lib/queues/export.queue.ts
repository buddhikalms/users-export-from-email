import { getQueue } from "@/lib/queues/queue-service";

export const excelExportQueue = getQueue("EXCEL_EXPORT");
export const csvExportQueue = getQueue("CSV_EXPORT");
