import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";

const app = new Hono<{
  Variables: {
    user: any;
    session: any;
  };
}>();

// Create a ride request (user books a ride)
app.post(
  "/requests",
  zValidator(
    "json",
    z.object({
      pickupAddress: z.string(),
      destinationAddress: z.string(),
      distance: z.number(),
      estimatedDuration: z.number(),
      estimatedFare: z.number(),
      rideType: z.string(), // "standard", "premium", "accessible", "xl"
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = c.req.valid("json");
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds

    try {
      const rideRequest = await prisma.rideRequest.create({
        data: {
          userId: user.id,
          pickupAddress: body.pickupAddress,
          destinationAddress: body.destinationAddress,
          distance: body.distance,
          estimatedDuration: body.estimatedDuration,
          estimatedFare: body.estimatedFare,
          rideType: body.rideType,
          expiresAt,
        },
      });

      return c.json(rideRequest, 201);
    } catch (error) {
      return c.json({ error: "Failed to create ride request" }, 500);
    }
  }
);

// Get available ride requests for drivers
app.get("/requests/available", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const now = new Date();
    const availableRequests = await prisma.rideRequest.findMany({
      where: {
        status: "pending",
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json(availableRequests);
  } catch (error) {
    return c.json({ error: "Failed to fetch available requests" }, 500);
  }
});

// Driver accepts a ride offer
app.post(
  "/requests/:requestId/accept",
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const requestId = c.req.param("requestId");

    try {
      // Check if request still exists and is pending
      const rideRequest = await prisma.rideRequest.findUnique({
        where: { id: requestId },
      });

      if (!rideRequest) {
        return c.json({ error: "Ride request not found" }, 404);
      }

      if (rideRequest.status !== "pending") {
        return c.json({ error: "Ride request is no longer available" }, 400);
      }

      // Create ride offer
      const offer = await prisma.rideOffer.create({
        data: {
          rideRequestId: requestId,
          driverId: user.id,
          status: "accepted",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
        include: {
          rideRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update ride request status
      await prisma.rideRequest.update({
        where: { id: requestId },
        data: { status: "accepted" },
      });

      return c.json(offer, 201);
    } catch (error) {
      return c.json({ error: "Failed to accept ride" }, 500);
    }
  }
);

// Get pending offers for a driver
app.get("/offers/pending", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const now = new Date();
    const pendingOffers = await prisma.rideOffer.findMany({
      where: {
        driverId: user.id,
        status: "pending",
        expiresAt: {
          gt: now,
        },
      },
      include: {
        rideRequest: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json(pendingOffers);
  } catch (error) {
    return c.json({ error: "Failed to fetch pending offers" }, 500);
  }
});

// Reject a ride offer
app.post("/offers/:offerId/reject", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const offerId = c.req.param("offerId");

  try {
    const offer = await prisma.rideOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return c.json({ error: "Offer not found" }, 404);
    }

    if (offer.driverId !== user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await prisma.rideOffer.update({
      where: { id: offerId },
      data: { status: "rejected" },
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to reject offer" }, 500);
  }
});

export default app;
