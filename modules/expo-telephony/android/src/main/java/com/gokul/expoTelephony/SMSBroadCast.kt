package com.gokul.expoTelephony
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import androidx.core.os.bundleOf

class SMSBroadCast : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            return
        }

        for (smsMessage in Telephony.Sms.Intents.getMessagesFromIntent(intent)) {
            if (ExpoTelephonyModule.instance != null) {
                ExpoTelephonyModule.instance?.sendEvent(ExpoTelephonyModule.SMS_RECEIVED_EVENT, bundleOf(
                    "sender" to smsMessage.originatingAddress,
                    "body" to smsMessage.messageBody,
                    "simIndex" to smsMessage.indexOnIcc.toString()
                ))
            }
        }
    }
}