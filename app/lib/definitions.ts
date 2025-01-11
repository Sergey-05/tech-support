export type User = {
    user_fullname: string;
    user_email: string;
    user_phone: string;
    user_role: string;
  };
  
export type Request = {
    request_id: number;
    request_date: string;
    request_head: string;
    request_descr: string;
    request_status: string;
    category_id: number;
    user_id: number;
    attached_at?: string;
    attached_to?: number;
    request_time_left?: string;
  };
  
export type DashboardData = {
    user: User;
    requests: Request[];
  };
  