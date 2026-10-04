import { Router, Request, Response } from "express";
import {
  analyzeMeetingContent,
  generateFollowUpEmail,
  queryMeetingKnowledge,
  generateCatchMeUp,
  AttendeeRef,
} from "./geminiService";
import { getAvailableProviders } from "./multiProviderService";

export const apiRouter = Router();

apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Cadence Meeting Intelligence",
    version: "2.5.0",
  });
});

apiRouter.get("/ai/providers", (_req: Request, res: Response) => {
  res.json({
    providers: getAvailableProviders(),
  });
});

apiRouter.post("/meeting/analyze", async (req: Request, res: Response) => {
  try {
    const { transcript, attendees, title, language } = req.body as {
      transcript?: string;
      attendees?: AttendeeRef[];
      title?: string;
      language?: string;
    };

    if (!transcript || typeof transcript !== "string") {
      res.status(400).json({ error: "Missing required 'transcript' text." });
      return;
    }

    const result = await analyzeMeetingContent(
      transcript,
      attendees || [],
      title || "Team Session",
      language || "English"
    );

    res.json(result);
  } catch (error: any) {
    console.error("API /meeting/analyze error:", error);
    res.status(500).json({
      error: error?.message || "Failed to process meeting analysis.",
    });
  }
});

apiRouter.post("/ai/query-knowledge", async (req: Request, res: Response) => {
  try {
    const { query, meetings, tasks } = req.body;

    if (!query) {
      res.status(400).json({ error: "Missing search query." });
      return;
    }

    const result = await queryMeetingKnowledge(
      query,
      meetings || [],
      tasks || []
    );

    res.json(result);
  } catch (error: any) {
    console.error("API /ai/query-knowledge error:", error);
    res.status(500).json({
      error: error?.message || "Failed to query organizational memory.",
    });
  }
});

apiRouter.post("/meeting/catch-me-up", async (req: Request, res: Response) => {
  try {
    const { title, elapsedMinutes, transcript } = req.body;

    const bullets = await generateCatchMeUp(
      title || "Session",
      elapsedMinutes || 15,
      transcript || ""
    );

    res.json({ bullets });
  } catch (error: any) {
    console.error("API /meeting/catch-me-up error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate catch up brief.",
    });
  }
});

apiRouter.post("/meeting/generate-email", async (req: Request, res: Response) => {
  try {
    const { title, summary, decisions, tasks } = req.body;

    const emailText = await generateFollowUpEmail(
      title || "Meeting Recap",
      summary || [],
      decisions || [],
      tasks || []
    );

    res.json({ email: emailText });
  } catch (error: any) {
    console.error("API /meeting/generate-email error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate follow-up email.",
    });
  }
});
