export function sendSuccess(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

export function sendError(
  res,
  message = 'Internal Server Error',
  statusCode = 500,
  details = undefined
) {
  const error =
    details !== undefined && details !== null
      ? { message, details }
      : { message };

  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
  });
}

