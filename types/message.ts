export interface Message {
  id: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'failed';
}