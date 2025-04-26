export type SMSDataType = { sender: string, body: string, simIndex: string }
export type PhoneStateType = { phoneNumber: string }

export type ExpoTelephonyModuleEvents = {
  onReceiveSMS: (data: SMSDataType) => void;
  onMissedCall: (data: PhoneStateType) => void;
};

