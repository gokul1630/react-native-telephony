package com.gokul.expoTelephony

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.CallLog
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.os.bundleOf


open class TelephonyBroadcast : BroadcastReceiver() {
    private var wasRinging = false
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent != null) {
            if (intent.action.equals(TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {
                val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)

                if (TelephonyManager.EXTRA_STATE_RINGING == stateStr) {
                    wasRinging = true
                } else if (TelephonyManager.EXTRA_STATE_IDLE == stateStr) {
                    if (wasRinging) {
                        wasRinging = false
                        Log.d("PhoneCallReceiver", "Missed call detected")

                        getLastMissedCall(context!!)
                    }
                } else if (TelephonyManager.EXTRA_STATE_OFFHOOK == stateStr) {
                    wasRinging = false
                }
            }
        }
    }

    private fun getLastMissedCall(context: Context) {
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_CALL_LOG
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val cursor = context.contentResolver.query(
            CallLog.Calls.CONTENT_URI,
            null,
            CallLog.Calls.TYPE + " = " + CallLog.Calls.MISSED_TYPE,
            null,
            CallLog.Calls.DATE + " DESC"
        )

        if (cursor != null && cursor.moveToFirst()) {
            val missedNumber = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER))
            Log.d("PhoneCallReceiver", "Missed call from: $missedNumber")

            ExpoTelephonyModule.instance?.sendEvent(
                ExpoTelephonyModule.MISSED_CALL_EVENT, bundleOf(
                    "phoneNumber" to missedNumber
                )
            )
            cursor.close()
        }
    }
}