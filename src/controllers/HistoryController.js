import Report from "../models/schema.js";

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) { next(err); }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) { next(err); }
};


export const createReport = async (req, res, next) => {
  try {
    const { url, score, verdict } = req.body;

    // Validate required fields
    if (!url || !score || !verdict) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create report in DB
    const report = await Report.create({ url, score, verdict });

    // Respond with the created report
    res.status(201).json(report);
  } catch (err) {
    next(err); // pass to Express error handler
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (err) { next(err); }
};

