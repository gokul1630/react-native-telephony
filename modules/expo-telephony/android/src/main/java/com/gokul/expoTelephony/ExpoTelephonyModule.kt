package com.gokul.expoTelephony

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.telephony.TelephonyManager
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition


class ExpoTelephonyModule : Module() {


    companion object {
        var instance: ExpoTelephonyModule? = null
        val SMS_RECEIVED_EVENT = "onReceiveSMS"
        val MISSED_CALL_EVENT = "onMissedCall"
    }


    private var phoneStateReceiver: BroadcastReceiver? = null


    override fun definition() = ModuleDefinition {
        instance = this@ExpoTelephonyModule
        Name("ExpoTelephony")

        Function("startListening") {
            startListening()
        }

        Function("stopListening") {
            stopListening()
        }


        Events(SMS_RECEIVED_EVENT, MISSED_CALL_EVENT)
    }

    private fun startListening() {
        val context: Context? = appContext.reactContext
        val filter = IntentFilter()
        filter.addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED)

        phoneStateReceiver = TelephonyBroadcast()

        context?.registerReceiver(phoneStateReceiver, filter)

    }

    private fun stopListening() {
        if (phoneStateReceiver != null) {
            val context: Context? = appContext.reactContext
            context?.unregisterReceiver(phoneStateReceiver)
            phoneStateReceiver = null
        }
    }
}
