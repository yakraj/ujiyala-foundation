export function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (e) {
      // return full zod error array for easier debugging in dev
      const details = e.errors?.map(err => ({ path: err.path, message: err.message })) || [];
      console.error('Validation error:', details);
      return res.status(400).json({ ok:false, message: e.errors?.[0]?.message || 'Validation error', details });
    }
  };
}
