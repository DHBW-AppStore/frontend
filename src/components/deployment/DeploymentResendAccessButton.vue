<script setup lang="ts">
/**
 * "Resend access" button of one team member: shows the send state
 * (sending / sent / error) and is disabled while sending or while the
 * deployment is busy. The request itself is handled by the caller
 * (``useResendAccess``).
 */
import { AlertCircle, Check, Loader2, Send } from 'lucide-vue-next'
import type { ResendState } from '@/composables/useResendAccess'

defineProps<{
  state: ResendState | undefined
  /** Deployment still moving — sending is not possible yet. */
  busy: boolean
}>()

defineEmits<{
  (e: 'resend'): void
}>()
</script>

<template>
  <button
    @click="$emit('resend')"
    :disabled="state === 'sending' || busy"
    :title="busy
      ? $t('DeploymentDetailView.resendAccessBusyTooltip')
      : $t('DeploymentDetailView.resendAccessTooltip')"
    class="w-full lg:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
    :class="state === 'sent'
      ? 'bg-success-dot text-on-accent border-success-dot'
      : state === 'error'
        ? 'bg-danger-dot/10 text-danger border-danger-dot/30'
        : 'bg-panel text-fg border-strong hover:bg-line/[.04] disabled:opacity-50'">
    <Loader2 v-if="state === 'sending'" :size="14"
      class="animate-spin" />
    <Check v-else-if="state === 'sent'" :size="14" />
    <AlertCircle v-else-if="state === 'error'" :size="14" />
    <Send v-else :size="14" />
    <span>
      {{ state === 'sending'
        ? $t('DeploymentDetailView.resendAccessSending')
        : state === 'sent'
          ? $t('DeploymentDetailView.resendAccessSent')
          : state === 'error'
            ? $t('DeploymentDetailView.resendAccessRetry')
            : $t('DeploymentDetailView.resendAccessButton') }}
    </span>
  </button>
</template>
