import { NativeModule, requireNativeModule } from 'expo';

import { ExpoTelephonyModuleEvents } from './ExpoTelephony.types';

declare class ExpoTelephonyModule extends NativeModule<ExpoTelephonyModuleEvents> {
	startListening: () => void;
	stopListening: () => void;
}

export default requireNativeModule<ExpoTelephonyModule>('ExpoTelephony');
