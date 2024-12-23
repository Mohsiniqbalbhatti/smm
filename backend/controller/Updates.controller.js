import express from "express";
import Update from "../model/update.model.js";

export const fetchAllUpdates = async (req, res) => {
  try {
    const updates = await Update.find({});

    if (updates.length > 0) {
      return res.json({ updates });
    } else {
      return res.status(404).json({ message: "No updates found" });
    }
  } catch (error) {
    console.error("Error fetching updates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
