import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {


  const reporter_id = (req as any).user.id;
  try {
    const result = await issueService.createIssueService(reporter_id, req.body);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};



const getAllIssues = async (req: Request, res: Response) => {
  try {
    const filters = req.query;

    const result = await issueService.getAllIssuesService(filters);

    res.status(200).json({
      success: true,
      message: "Issues fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueService(id as string);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "No issue found!",
        data: null,
      });
    }
    res.status(200).json({
      success: true,

      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  const id = (req as any).req.params.id;

  try {
    const result = await issueService.updateIssueService(
      req.body,
      id,
      (req as any).req.user,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.deleteIssueService(id as string);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "No issue found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};