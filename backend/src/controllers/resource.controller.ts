import { Request, Response } from "express";
import { getResources as getResourcesService, getSlotsForResource } from "../services/booking.service";

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await getResourcesService();
    res.json({ success: true, data: resources });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResourceSlots = async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.id as string;
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const timezone = (req.query.timezone as string) || "UTC";

    const slotsData = await getSlotsForResource(
      resourceId,
      date,
      timezone
    );

    res.json({ success: true, data: slotsData });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
