import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { createNoChangeCertification } from "@/lib/renewal-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { facilityId, renewalScheduleId } = body

    if (!facilityId || !renewalScheduleId) {
      return {
        success: false,
        error: "Missing required fields: facilityId, renewalScheduleId",
      }
    }

    const cert = await createNoChangeCertification({
      clientId: context.clientId,
      facilityId,
      renewalScheduleId,
      certifiedBy: context.userId,
    })

    return {
      success: true,
      data: {
        certificationId: cert.id,
        certificationDate: cert.certificationDate,
        text: cert.text,
        message: "No-change certification created. Ready for e-signature and submission.",
      },
    }
  },
  { requiredRoles: ["official_correspondent"] },
)
