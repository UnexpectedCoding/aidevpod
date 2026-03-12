// middleware/validate.middleware.js

const validateProjectRequest = (req, res, next) => {
  const { projectName, projectIdea } = req.body;

  if (!projectName || typeof projectName !== "string") {
    return res.status(400).json({
      success: false,
      message: "projectName is required and must be a string",
    });
  }

  if (!projectIdea || typeof projectIdea !== "string") {
    return res.status(400).json({
      success: false,
      message: "projectIdea is required and must be a string",
    });
  }

  if (projectName.length < 3) {
    return res.status(400).json({
      success: false,
      message: "projectName must be at least 3 characters long",
    });
  }

  if (projectIdea.length < 10) {
    return res.status(400).json({
      success: false,
      message: "projectIdea must be at least 10 characters long",
    });
  }

  next();
};

module.exports = {
  validateProjectRequest,
};