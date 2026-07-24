import webpush from 'web-push';

// VAPID is only configured once both keys are present. If either is
// missing, sendPushToUser becomes a no-op so booking endpoints can
// always call us without a try/catch.

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@homehelp.ai';

let configured = false;

export function configureWebPush(): void {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return;
  }
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    configured = true;
  } catch (err) {
    console.error('[push] configureWebPush failed:', err);
    configured = false;
  }
}

interface PrismaSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Fan out a notification to every active subscription belonging to a user.
// Failures (expired endpoints, blocked push services) are dropped silently;
// the dead-endpoint cleanup happens via Prisma unique-constraint rekey on
// the next subscribe attempt.
export async function sendPushToUser(
  prisma: {
    pushSubscription: {
      findMany: (args: { where: { userId: string } }) => Promise<PrismaSubscription[]>;
      delete: (args: { where: { endpoint: string } }) => Promise<unknown>;
    };
  },
  userId: string,
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    icon?: string;
  },
): Promise<void> {
  if (!configured) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  const json = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
        );
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === 'object' && 'statusCode' in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        } else {
          console.error('[push] sendNotification error:', err);
        }
      }
    }),
  );
}
