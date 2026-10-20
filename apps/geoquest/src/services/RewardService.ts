export interface RewardResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export async function disburseAirtime(
  phoneNumber: string,
  amount: number,
): Promise<RewardResult> {
  console.log(`[RewardService STUB] Disbursing NGN ${amount} airtime to ${phoneNumber}`);
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });
  return { success: true, reference: `STUB-${Date.now()}` };
}
