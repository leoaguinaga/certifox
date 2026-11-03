export interface TicketDto {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  subject: string;
  category: string;
  message: string;
}
