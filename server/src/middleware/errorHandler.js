export function notFound(req, res, next) {
  res.status(404).json({ ok: false, message: "Not Found" });
}

export function errorHandler(err, req, res, next) {
  console.error("Server Error:", err);
  const status = err.status || 500;
  res
    .status(status)
    .json({ ok: false, message: err.message || "Server Error" });
}
